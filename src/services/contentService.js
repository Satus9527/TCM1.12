/**
 * 个性化内容服务层
 * 处理用户收藏、模拟方案和文件元数据的业务逻辑
 */

const db = require('../models');
const { UserCollection, UserSimulation, UserFile } = db;
const logger = require('../utils/logger');
const { UniqueConstraintError } = require('sequelize');
const d8Sdk = require('../utils/d8Sdk');
const config = require('../../config');

/**
 * 添加收藏
 * @param {string} userId - 用户ID
 * @param {string} contentType - 内容类型 ('medicine' | 'formula')
 * @param {string} contentId - 内容ID
 * @returns {Promise<Object>} 收藏记录
 */
async function addCollection(userId, contentType, contentId) {
  try {
    const collection = await UserCollection.create({
      user_id: userId,
      content_type: contentType,
      content_id: contentId
    });

    logger.info('用户收藏已添加', {
      userId,
      contentType,
      contentId,
      collectionId: collection.collection_id
    });

    return collection;
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      logger.warn('重复收藏', { userId, contentType, contentId });
      throw new Error('DUPLICATE_COLLECTION');
    }
    throw error;
  }
}

/**
 * 获取用户的所有收藏
 * @param {string} userId - 用户ID
 * @returns {Promise<Array>} 收藏列表
 */
async function getCollections(userId) {
  const collections = await UserCollection.findAll({
    where: { user_id: userId },
    order: [['created_at', 'DESC']]
  });

  logger.info('获取用户收藏列表', { userId, count: collections.length });
  return collections;
}

/**
 * 删除收藏
 * @param {string} userId - 用户ID
 * @param {string} collectionId - 收藏ID
 * @returns {Promise<number>} 删除的记录数
 */
async function deleteCollection(userId, collectionId) {
  const deletedCount = await UserCollection.destroy({
    where: {
      collection_id: collectionId,
      user_id: userId // 确保用户只能删除自己的收藏
    }
  });

  if (deletedCount === 0) {
    logger.warn('删除收藏失败 - 记录不存在或无权限', { userId, collectionId });
  } else {
    logger.info('收藏已删除', { userId, collectionId });
  }

  return deletedCount;
}

/**
 * 保存模拟方案
 * @param {string} userId - 用户ID
 * @param {Object} simulationData - 模拟方案数据
 * @returns {Promise<Object>} 模拟方案记录
 */
async function saveSimulation(userId, simulationData) {
  const simulation = await UserSimulation.create({
    user_id: userId,
    name: simulationData.name,
    composition_data: simulationData.composition_data,
    ai_analysis_data: simulationData.ai_analysis_data || null,
    user_notes: simulationData.user_notes || null
  });

  logger.info('模拟方案已保存', {
    userId,
    simulationId: simulation.simulation_id,
    name: simulation.name
  });

  return simulation;
}

/**
 * 获取用户的所有模拟方案
 * @param {string} userId - 用户ID
 * @returns {Promise<Array>} 模拟方案列表
 */
async function getSimulations(userId) {
  const simulations = await UserSimulation.findAll({
    where: { user_id: userId },
    order: [['created_at', 'DESC']]
  });

  logger.info('获取用户模拟方案列表', { userId, count: simulations.length });
  return simulations;
}

/**
 * 删除模拟方案
 * @param {string} userId - 用户ID
 * @param {string} simulationId - 模拟方案ID
 * @returns {Promise<number>} 删除的记录数
 */
async function deleteSimulation(userId, simulationId) {
  const deletedCount = await UserSimulation.destroy({
    where: {
      simulation_id: simulationId,
      user_id: userId // 确保用户只能删除自己的方案
    }
  });

  if (deletedCount === 0) {
    logger.warn('删除模拟方案失败 - 记录不存在或无权限', { userId, simulationId });
  } else {
    logger.info('模拟方案已删除', { userId, simulationId });
  }

  return deletedCount;
}

/**
 * 保存文件元数据（内部接口）
 * @param {Object} metadata - 文件元数据
 * @returns {Promise<Object>} 文件记录
 */
async function saveFileMeta(metadata) {
  const file = await UserFile.create({
    user_id: metadata.user_id,
    file_name: metadata.file_name,
    storage_url: metadata.storage_url,
    file_type: metadata.file_type || null,
    file_size: metadata.file_size || null,
    uploaded_at: metadata.uploaded_at || new Date()
  });

  logger.info('文件元数据已保存', {
    userId: metadata.user_id,
    fileId: file.file_id,
    fileName: metadata.file_name
  });

  return file;
}

/**
 * 获取用户的所有文件
 * @param {string} userId - 用户ID
 * @returns {Promise<Array>} 文件列表
 */
async function getFiles(userId) {
  const files = await UserFile.findAll({
    where: { user_id: userId },
    order: [['uploaded_at', 'DESC']]
  });

  logger.info('获取用户文件列表', { userId, count: files.length });
  return files;
}

/**
 * 删除文件及其元数据
 * @param {string} userId - 用户ID
 * @param {string} fileId - 文件ID
 * @returns {Promise<Object>} 删除结果 { success: boolean, message: string }
 */
async function deleteFile(userId, fileId) {
  // 查询文件元数据
  const file = await UserFile.findOne({
    where: {
      file_id: fileId,
      user_id: userId // 确保用户只能删除自己的文件
    }
  });

  if (!file) {
    logger.warn('删除文件失败 - 文件不存在或无权限', { userId, fileId });
    return { success: false, message: 'FILE_NOT_FOUND' };
  }

  const storageUrl = file.storage_url;

  // 删除对象存储中的文件（调用D8 SDK）
  try {
    // 从storage_url中提取Bucket和Key
    const { Bucket, Key } = d8Sdk.parseStorageUrl(storageUrl);
    
    logger.info('开始删除D8文件', { storageUrl, fileId, Bucket, Key });
    
    await d8Sdk.deleteObject({ Bucket, Key });
    
    logger.info('D8文件删除成功', { storageUrl, fileId });
  } catch (d8Error) {
    // D8删除失败不应阻止数据库清理（避免元数据残留）
    logger.error('D8文件删除失败，但继续删除数据库记录', {
      error: d8Error.message,
      storageUrl,
      fileId,
      service: 'tcm-platform-backend'
    });
    // TODO: 记录到告警系统，后续手动清理孤立文件
  }

  // 删除数据库记录
  const deletedCount = await UserFile.destroy({
    where: {
      file_id: fileId,
      user_id: userId
    }
  });

  if (deletedCount > 0) {
    logger.info('文件元数据已删除', { userId, fileId, storageUrl });
    return { success: true, message: 'FILE_DELETED' };
  } else {
    return { success: false, message: 'DELETE_FAILED' };
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

