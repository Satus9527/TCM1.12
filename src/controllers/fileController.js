/**
 * 文件上传控制器
 * 处理文件上传、列表和删除请求
 */

const d8Sdk = require('../utils/d8Sdk');
const contentService = require('../services/contentService');
const { sanitizeFileName, generateUniqueFileName } = require('../utils/fileUtils');
const { v4: uuidv4 } = require('uuid');
const config = require('../../config');
const logger = require('../utils/logger');

/**
 * 处理文件上传
 * 1. 流式上传到D8对象存储
 * 2. 调用P3服务保存元数据
 * 3. 处理错误和补偿逻辑
 */
async function handleUpload(req, res, next) {
  // req.file 由 multer 处理后附加，包含 stream 和 originalname
  if (!req.file) {
    return res.status(400).json({
      timestamp: new Date().toISOString(),
      status: 400,
      error: 'Bad Request',
      message: '未检测到上传文件',
      path: req.originalUrl
    });
  }

  const userId = req.user.id; // 来自 authenticateToken
  const originalFileName = req.file.originalname;
  const fileStream = req.file.stream; // 获取文件流
  const sanitizedFileName = sanitizeFileName(originalFileName);

  const fileId = uuidv4(); // 为文件生成 UUID (用于数据库主键)
  const storageKey = `uploads/users/${userId}/${fileId}_${sanitizedFileName}`; // D8 存储路径
  const detectedMimeType = req.file.mimetype || 'application/octet-stream';

  let storageUrl = null;
  let metadataSaved = false;

  try {
    // 1. 流式上传到 D8 (HP 1)
    logger.info(`Starting D8 upload for user ${userId}, file: ${sanitizedFileName}, key: ${storageKey}`);
    
    const uploadResult = await d8Sdk.uploadStream({
      Bucket: config.d8.bucket,
      Key: storageKey,
      Body: fileStream,
      ContentType: detectedMimeType
    });

    storageUrl = uploadResult.Location; // 获取 D8 返回的 URL
    logger.info(`D8 upload successful. URL: ${storageUrl}`);

    // 2. 内部调用 P3 保存元数据
    const metadata = {
      file_id: fileId, // 使用生成的 UUID
      user_id: userId,
      file_name: sanitizedFileName,
      storage_url: storageUrl,
      file_type: detectedMimeType,
      uploaded_at: new Date().toISOString()
    };

    logger.debug(`Calling P3 saveFileMeta with metadata:`, metadata);
    
    // 调用 service 函数保存元数据
    const savedMeta = await contentService.saveFileMeta(metadata);
    metadataSaved = true;
    
    logger.info(`P3 saveFileMeta successful. fileId: ${savedMeta.file_id}`);

    // 3. 全部成功，返回 201 Created
    res.status(201).json({
      message: '文件上传成功',
      data: {
        file_id: savedMeta.file_id,
        file_name: savedMeta.file_name,
        file_url: storageUrl,
        file_type: detectedMimeType
      }
    });

  } catch (error) {
    logger.error(`File upload process failed: ${error.message}`, { error });

    // 4. 处理错误和补偿逻辑
    if (storageUrl && !metadataSaved) {
      // D8 上传成功了，但 P3 保存失败了 -> 尝试删除 D8 文件
      logger.warn(`Metadata save failed. Attempting to delete orphaned D8 file: ${storageKey}`);
      
      try {
        const { Bucket, Key } = d8Sdk.parseStorageUrl(storageUrl);
        await d8Sdk.deleteObject({ Bucket, Key });
        logger.info(`Orphaned D8 file deleted successfully.`);
      } catch (deleteError) {
        logger.error(`Failed to delete orphaned D8 file ${storageKey}: ${deleteError.message}`, { deleteError });
        // 记录删除失败日志，但仍然返回 P3 失败的原始错误
      }
    }

    // 将错误传递给全局错误处理器
    next(error);
  }
}

/**
 * 获取用户文件列表
 */
async function listFiles(req, res, next) {
  try {
    const userId = req.user.id;

    const files = await contentService.getFiles(userId);

    res.status(200).json({
      message: '获取文件列表成功',
      data: files.map(file => ({
        file_id: file.file_id,
        file_name: file.file_name,
        storage_url: file.storage_url,
        file_type: file.file_type,
        uploaded_at: file.uploaded_at
      }))
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
          message: '文件不存在或无权访问',
          path: req.originalUrl
        });
      } else if (result.message === 'D8_DELETE_FAILED') {
        // 如果文件元数据已删除但D8删除失败，仍然返回404（因为元数据已不存在）
        return res.status(500).json({
          timestamp: new Date().toISOString(),
          status: 500,
          error: 'Internal Server Error',
          message: '文件删除失败（元数据已删除，但存储文件删除失败）',
          path: req.originalUrl
        });
      }
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
  handleUpload,
  listFiles,
  deleteFile
};
