/**
 * WebSocket 实时模拟服务
 * 
 * 功能：
 * - 处理 WebSocket 连接（票据验证）
 * - 实时同步方剂配方状态
 * - 即时安全检查（十八反、十九畏）
 * - 去抖动调用 E1 AI 分析服务
 * 
 * 架构：
 * - 使用 ws 库实现 WebSocket 服务器
 * - Redis 存储实时状态和票据
 * - Map 结构管理活跃连接
 */

const { WebSocketServer } = require('ws');
const url = require('url');
const axios = require('axios');
const redisClient = require('../utils/redisClient');
const safetyCheckService = require('./safetyCheckService');
const { UserSimulation } = require('../models');
const config = require('../../config');
const logger = require('../utils/logger');

// 存储 userId -> WebSocket 实例的映射
const connections = new Map();

// 存储 userId -> debounce-timer-ID 的映射
const debounceTimers = new Map();

// 去抖延迟时间（毫秒）
const DEBOUNCE_MS = parseInt(process.env.DEBOUNCE_MS, 10) || 300;

/**
 * 初始化 WebSocket 服务器
 * @param {Object} httpServer - HTTP 服务器实例（Express app）
 */
function initializeWebSocket(httpServer) {
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/api/simulation'
  });

  wss.on('connection', async (ws, req) => {
    let userId = null;
    
    try {
      // 处理连接（验证票据）
      userId = await handleConnection(ws, req);
      
      if (!userId) {
        // handleConnection 内部已处理关闭
        return;
      }

      connections.set(userId, ws);
      logger.info('WebSocket连接已建立', { 
        userId, 
        totalConnections: connections.size 
      });

      // 消息处理
      ws.on('message', (message) => {
        handleMessage(userId, message, ws).catch(err => {
          logger.error('处理WebSocket消息失败', { 
            userId, 
            error: err.message 
          });
        });
      });

      // 连接关闭
      ws.on('close', () => {
        logger.info('WebSocket连接已关闭', { userId });
        connections.delete(userId);
        
        // 清除去抖计时器
        if (debounceTimers.has(userId)) {
          clearTimeout(debounceTimers.get(userId));
          debounceTimers.delete(userId);
        }
      });

      // 错误处理
      ws.on('error', (error) => {
        logger.error('WebSocket连接错误', { 
          userId, 
          error: error.message 
        });
      });

    } catch (error) {
      logger.error('WebSocket连接建立失败', { error: error.message });
      ws.close(1011, '服务器内部错误');
    }
  });

  logger.info('WebSocket服务器已初始化', { path: '/api/simulation' });
}

/**
 * 处理 WebSocket 连接（票据验证）
 * @param {WebSocket} ws - WebSocket 实例
 * @param {Object} req - HTTP 请求对象
 * @returns {Promise<string|null>} - 用户ID或null
 */
async function handleConnection(ws, req) {
  // 1. 解析 URL 中的票据
  const queryParams = new URLSearchParams(url.parse(req.url).search);
  const ticket = queryParams.get('ticket');

  if (!ticket) {
    logger.warn('WebSocket连接尝试缺少票据');
    ws.close(1008, '需要访问票据');
    return null;
  }

  // 2. 验证 One_Time_Ticket（从 Redis）
  const ticketKey = `ws_ticket:${ticket}`;
  const userId = await redisClient.get(ticketKey);

  if (!userId) {
    logger.warn('WebSocket连接使用了无效或过期的票据', { ticket });
    ws.close(1008, '访问票据无效或已过期');
    return null;
  }

  // 3. 销毁票据（一次性使用）
  await redisClient.del(ticketKey);
  logger.debug('票据已验证并销毁', { userId, ticket });

  // 4. 检查是否已有此用户的连接
  if (connections.has(userId)) {
    logger.warn('用户已有活跃连接，关闭旧连接', { userId });
    const oldWs = connections.get(userId);
    oldWs.close(1012, '新连接已建立');
    connections.delete(userId);
  }

  // 5. 加载初始状态
  const stateKey = `sim:state:${userId}`;
  let initialState = await redisClient.get(stateKey);

  if (!initialState) {
    logger.debug('Redis中无活跃状态，从数据库加载', { userId });
    
    // 尝试从数据库加载最新保存的模拟记录
    try {
      const lastSavedSim = await UserSimulation.findOne({ 
        where: { user_id: userId }, 
        order: [['updated_at', 'DESC']] 
      });

      if (lastSavedSim) {
        initialState = JSON.stringify({
          simulation_id: lastSavedSim.simulation_id,
          formula_id: lastSavedSim.formula_id,
          composition: lastSavedSim.modified_composition,
          notes: lastSavedSim.user_notes,
          ai_analysis: lastSavedSim.ai_analysis
        });
        // 恢复到 Redis
        await redisClient.set(stateKey, initialState, 3600); // 1小时过期
      } else {
        // 默认空状态
        initialState = JSON.stringify({ 
          composition: [], 
          name: '我的新方剂',
          notes: ''
        });
      }
    } catch (error) {
      logger.error('从数据库加载模拟状态失败', { userId, error: error.message });
      // 使用默认空状态
      initialState = JSON.stringify({ 
        composition: [], 
        name: '我的新方剂',
        notes: ''
      });
    }
  }

  // 6. 推送初始状态给客户端
  ws.send(JSON.stringify({
    type: 'INIT_STATE',
    payload: JSON.parse(initialState),
    timestamp: new Date().toISOString()
  }));

  return userId;
}

/**
 * 处理客户端消息（增量更新）
 * @param {string} userId - 用户ID
 * @param {string|Buffer} message - 消息内容
 * @param {WebSocket} ws - WebSocket 实例
 */
async function handleMessage(userId, message, ws) {
  const stateKey = `sim:state:${userId}`;
  let updateData;

  // 1. 解析客户端消息
  try {
    updateData = JSON.parse(message.toString());
    
    if (updateData.type !== 'UPDATE_COMPOSITION') {
      logger.warn('收到未知消息类型', { userId, type: updateData.type });
      return;
    }

    // 验证 payload
    if (!updateData.payload || !updateData.payload.composition) {
      logger.warn('消息payload格式无效', { userId });
      ws.send(JSON.stringify({ 
        type: 'ERROR', 
        payload: { message: '消息格式无效' } 
      }));
      return;
    }
  } catch (error) {
    logger.error('解析WebSocket消息失败', { userId, error: error.message });
    ws.send(JSON.stringify({ 
      type: 'ERROR', 
      payload: { message: '消息格式错误' } 
    }));
    return;
  }

  // 2. 更新 Redis 状态
  let currentState = updateData.payload;

  // 3. 立即执行安全检查
  const compositionDetails = currentState.composition;
  let safetyResult = { isSafe: true, warnings: [] };

  if (compositionDetails && compositionDetails.length > 0) {
    try {
      safetyResult = safetyCheckService.checkFormulaSafety(compositionDetails);
    } catch (error) {
      logger.error('安全检查执行失败', { userId, error: error.message });
    }
  }

  // 4. 推送安全检查结果
  if (!safetyResult.isSafe && safetyResult.warnings.length > 0) {
    logger.debug('检测到配伍禁忌', { 
      userId, 
      warnings: safetyResult.warnings 
    });
    
    ws.send(JSON.stringify({
      type: 'SAFETY_WARNING',
      payload: safetyResult,
      timestamp: new Date().toISOString()
    }));
  } else {
    ws.send(JSON.stringify({ 
      type: 'SAFETY_OK',
      timestamp: new Date().toISOString()
    }));
  }

  // 5. 将新状态写回 Redis
  try {
    await redisClient.set(stateKey, JSON.stringify(currentState), 3600); // 1小时过期
  } catch (error) {
    logger.error('更新Redis状态失败', { userId, error: error.message });
  }

  // 6. 重置去抖计时器
  if (debounceTimers.has(userId)) {
    clearTimeout(debounceTimers.get(userId));
  }

  const timerId = setTimeout(() => {
    triggerDebouncedAnalysis(userId);
  }, DEBOUNCE_MS);

  debounceTimers.set(userId, timerId);
}

/**
 * 触发去抖后的 AI 分析
 * @param {string} userId - 用户ID
 */
async function triggerDebouncedAnalysis(userId) {
  logger.debug('去抖计时器触发，开始AI分析', { userId });

  // 1. 确保用户仍在连接
  const ws = connections.get(userId);
  if (!ws || ws.readyState !== ws.OPEN) {
    logger.warn('用户已断开连接，取消AI分析', { userId });
    debounceTimers.delete(userId);
    return;
  }

  // 2. 从 Redis 读取最终配方状态
  const stateKey = `sim:state:${userId}`;
  let finalStateStr;
  
  try {
    finalStateStr = await redisClient.get(stateKey);
  } catch (error) {
    logger.error('从Redis读取状态失败', { userId, error: error.message });
    debounceTimers.delete(userId);
    return;
  }

  if (!finalStateStr) {
    logger.warn('Redis中无状态数据，取消AI分析', { userId });
    debounceTimers.delete(userId);
    return;
  }

  const finalState = JSON.parse(finalStateStr);
  const composition = finalState.composition;

  // 检查配方是否为空
  if (!composition || composition.length === 0) {
    logger.debug('配方为空，跳过AI分析', { userId });
    debounceTimers.delete(userId);
    return;
  }

  // 3. 构建 E1 请求体
  const e1RequestBody = {
    composition: composition.map(item => ({
      medicine_id: item.medicine_id || item.id,
      name: item.name,
      dosage: item.dosage || '10g'
    }))
  };

  try {
    // 4. 调用 E1 /analyze/composition 接口
    logger.debug('调用E1分析服务', { userId, compositionCount: composition.length });
    
    const response = await axios.post(
      config.aiService.analyzeUrl,
      e1RequestBody,
      { 
        timeout: parseInt(config.aiService.timeout, 10) || 10000 
      }
    );

    // 5. 处理 E1 响应（成功）
    if (response.status === 200 && response.data) {
      const analysisData = response.data;
      
      // 基础验证
      if (!analysisData.analysis && !analysisData.suggestions) {
        throw new Error('E1响应格式无效');
      }

      logger.info('AI分析成功', { userId });

      // 推送分析结果
      ws.send(JSON.stringify({
        type: 'AI_ANALYSIS_RESULT',
        payload: analysisData,
        timestamp: new Date().toISOString()
      }));
    } else {
      throw new Error(`E1返回非200状态: ${response.status}`);
    }

  } catch (error) {
    // 6. 处理 E1 响应（失败）
    logger.error('AI分析失败', { 
      userId, 
      error: error.message,
      code: error.code 
    });

    let errorMessage = 'AI分析服务暂时不可用';
    
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      errorMessage = 'AI分析超时，请稍后再试';
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = 'AI服务连接失败';
    }

    // 推送错误反馈
    ws.send(JSON.stringify({
      type: 'AI_ANALYSIS_ERROR',
      payload: { 
        message: errorMessage,
        code: error.code || 'UNKNOWN'
      },
      timestamp: new Date().toISOString()
    }));
  } finally {
    // 清除计时器
    debounceTimers.delete(userId);
  }
}

/**
 * 关闭所有连接（用于服务器关闭）
 */
function closeAllConnections() {
  logger.info('关闭所有WebSocket连接', { count: connections.size });
  
  for (const [userId, ws] of connections.entries()) {
    try {
      ws.close(1001, '服务器关闭');
    } catch (error) {
      logger.error('关闭连接失败', { userId, error: error.message });
    }
  }
  
  connections.clear();
  
  // 清除所有计时器
  for (const timerId of debounceTimers.values()) {
    clearTimeout(timerId);
  }
  debounceTimers.clear();
}

/**
 * 获取当前连接统计
 */
function getConnectionStats() {
  return {
    activeConnections: connections.size,
    pendingAnalyses: debounceTimers.size
  };
}

module.exports = {
  initializeWebSocket,
  closeAllConnections,
  getConnectionStats
};

