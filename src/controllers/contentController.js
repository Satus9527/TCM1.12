/**
 * 个性化内容控制器
 * 处理用户收藏、模拟方案和文件相关的HTTP请求
 */

const contentService = require('../services/contentService');
const logger = require('../utils/logger');

/**
 * 添加收藏
 */
async function addCollection(req, res, next) {
  try {
    const userId = req.user.id; // 从认证中间件获取
    const { content_type, content_id } = req.body;

    const collection = await contentService.addCollection(userId, content_type, content_id);

    res.status(201).json({
      message: '收藏添加成功',
      data: {
        collection_id: collection.collection_id,
        content_type: collection.content_type,
        content_id: collection.content_id,
        created_at: collection.created_at
      }
    });
  } catch (error) {
    if (error.message === 'DUPLICATE_COLLECTION') {
      return res.status(409).json({
        timestamp: new Date().toISOString(),
        status: 409,
        error: 'Conflict',
        message: '该内容已经收藏过了',
        path: req.originalUrl
      });
    }
    logger.error('添加收藏失败', { error: error.message, userId: req.user.id });
    next(error);
  }
}

/**
 * 获取用户收藏列表
 */
async function getCollections(req, res, next) {
  try {
    const userId = req.user.id;

    const collections = await contentService.getCollections(userId);

    res.status(200).json({
      message: '获取收藏列表成功',
      data: collections,
      total: collections.length
    });
  } catch (error) {
    logger.error('获取收藏列表失败', { error: error.message, userId: req.user.id });
    next(error);
  }
}

/**
 * 删除收藏
 */
async function deleteCollection(req, res, next) {
  try {
    const userId = req.user.id;
    const { collection_id } = req.params;

    const deletedCount = await contentService.deleteCollection(userId, collection_id);

    if (deletedCount === 0) {
      return res.status(404).json({
        timestamp: new Date().toISOString(),
        status: 404,
        error: 'Not Found',
        message: '收藏记录不存在或无权删除',
        path: req.originalUrl
      });
    }

    res.status(200).json({
      message: '收藏删除成功'
    });
  } catch (error) {
    logger.error('删除收藏失败', { error: error.message, userId: req.user.id });
    next(error);
  }
}

/**
 * 保存模拟方案
 */
async function saveSimulation(req, res, next) {
  try {
    const userId = req.user.id;
    const simulationData = req.body;

    const simulation = await contentService.saveSimulation(userId, simulationData);

    res.status(201).json({
      message: '模拟方案保存成功',
      data: {
        simulation_id: simulation.simulation_id,
        name: simulation.name,
        created_at: simulation.created_at
      }
    });
  } catch (error) {
    logger.error('保存模拟方案失败', { error: error.message, userId: req.user.id });
    next(error);
  }
}

/**
 * 获取用户模拟方案列表
 */
async function getSimulations(req, res, next) {
  try {
    const userId = req.user.id;

    const simulations = await contentService.getSimulations(userId);

    res.status(200).json({
      message: '获取模拟方案列表成功',
      data: simulations,
      total: simulations.length
    });
  } catch (error) {
    logger.error('获取模拟方案列表失败', { error: error.message, userId: req.user.id });
    next(error);
  }
}

/**
 * 删除模拟方案
 */
async function deleteSimulation(req, res, next) {
  try {
    const userId = req.user.id;
    const { simulation_id } = req.params;

    const deletedCount = await contentService.deleteSimulation(userId, simulation_id);

    if (deletedCount === 0) {
      return res.status(404).json({
        timestamp: new Date().toISOString(),
        status: 404,
        error: 'Not Found',
        message: '模拟方案不存在或无权删除',
        path: req.originalUrl
      });
    }

    res.status(200).json({
      message: '模拟方案删除成功'
    });
  } catch (error) {
    logger.error('删除模拟方案失败', { error: error.message, userId: req.user.id });
    next(error);
  }
}

/**
 * 保存文件元数据（内部接口）
 */
async function saveFileMeta(req, res, next) {
  try {
    const metadata = req.body;

    const file = await contentService.saveFileMeta(metadata);

    res.status(201).json({
      message: '文件元数据保存成功',
      data: {
        file_id: file.file_id,
        file_name: file.file_name,
        uploaded_at: file.uploaded_at
      }
    });
  } catch (error) {
    logger.error('保存文件元数据失败', { error: error.message });
    next(error);
  }
}

/**
 * 获取用户文件列表
 */
async function getFiles(req, res, next) {
  try {
    const userId = req.user.id;

    const files = await contentService.getFiles(userId);

    res.status(200).json({
      message: '获取文件列表成功',
      data: files,
      total: files.length
    });
  } catch (error) {
    logger.error('获取文件列表失败', { error: error.message, userId: req.user.id });
    next(error);
  }
}

/**
 * 删除文件
 */
async function deleteFile(req, res, next) {
  try {
    const userId = req.user.id;
    const { file_id } = req.params;

    const result = await contentService.deleteFile(userId, file_id);

    if (!result.success) {
      if (result.message === 'FILE_NOT_FOUND') {
        return res.status(404).json({
          timestamp: new Date().toISOString(),
          status: 404,
          error: 'Not Found',
          message: '文件不存在或无权删除',
          path: req.originalUrl
        });
      }
      return res.status(500).json({
        timestamp: new Date().toISOString(),
        status: 500,
        error: 'Internal Server Error',
        message: '文件删除失败',
        path: req.originalUrl
      });
    }

    res.status(200).json({
      message: '文件删除成功'
    });
  } catch (error) {
    logger.error('删除文件失败', { error: error.message, userId: req.user.id });
    next(error);
  }
}

module.exports = {
  addCollection,
  getCollections,
  deleteCollection,
  saveSimulation,
  getSimulations,
  deleteSimulation,
  saveFileMeta,
  getFiles,
  deleteFile
};

