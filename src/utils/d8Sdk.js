/**
 * D8对象存储SDK封装（AWS S3兼容）
 * 支持MinIO和AWS S3
 */

const { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const config = require('../../config');
const logger = require('./logger');

// 创建S3客户端实例
const s3Client = new S3Client({
  endpoint: config.d8.endpoint,
  region: config.d8.region,
  credentials: {
    accessKeyId: config.d8.accessKeyId,
    secretAccessKey: config.d8.secretAccessKey
  },
  forcePathStyle: config.d8.forcePathStyle // MinIO需要
});

/**
 * 上传文件流到D8对象存储
 * @param {Object} params - 上传参数
 * @param {string} params.Bucket - 存储桶名称
 * @param {string} params.Key - 对象键（文件路径）
 * @param {Stream} params.Body - 文件流
 * @param {string} params.ContentType - 文件MIME类型
 * @returns {Promise<Object>} - 上传结果，包含Location（文件URL）
 */
async function uploadStream({ Bucket, Key, Body, ContentType }) {
  try {
    logger.info(`[D8 SDK] Starting upload to bucket: ${Bucket}, key: ${Key}`);
    
    const command = new PutObjectCommand({
      Bucket,
      Key,
      Body,
      ContentType
    });

    const result = await s3Client.send(command);
    
    // 构造文件访问URL
    const Location = `${config.d8.endpoint}/${Bucket}/${Key}`;
    
    logger.info(`[D8 SDK] Upload successful. ETag: ${result.ETag}, Location: ${Location}`);
    
    return {
      ...result,
      Location,
      Bucket,
      Key
    };
  } catch (error) {
    logger.error(`[D8 SDK] Upload failed for ${Key}: ${error.message}`, { error });
    throw new Error(`D8对象存储上传失败: ${error.message}`);
  }
}

/**
 * 删除D8对象存储中的文件
 * @param {Object} params - 删除参数
 * @param {string} params.Bucket - 存储桶名称
 * @param {string} params.Key - 对象键（文件路径）
 * @returns {Promise<Object>} - 删除结果
 */
async function deleteObject({ Bucket, Key }) {
  try {
    logger.info(`[D8 SDK] Deleting object from bucket: ${Bucket}, key: ${Key}`);
    
    const command = new DeleteObjectCommand({
      Bucket,
      Key
    });

    const result = await s3Client.send(command);
    
    logger.info(`[D8 SDK] Delete successful for ${Key}`);
    
    return result;
  } catch (error) {
    logger.error(`[D8 SDK] Delete failed for ${Key}: ${error.message}`, { error });
    throw new Error(`D8对象存储删除失败: ${error.message}`);
  }
}

/**
 * 检查D8对象是否存在
 * @param {Object} params - 检查参数
 * @param {string} params.Bucket - 存储桶名称
 * @param {string} params.Key - 对象键（文件路径）
 * @returns {Promise<boolean>} - 文件是否存在
 */
async function objectExists({ Bucket, Key }) {
  try {
    const command = new HeadObjectCommand({
      Bucket,
      Key
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
      return false;
    }
    logger.error(`[D8 SDK] Check existence failed for ${Key}: ${error.message}`, { error });
    throw error;
  }
}

/**
 * 从storage_url中提取Bucket和Key
 * @param {string} storageUrl - 存储URL
 * @returns {Object} - {Bucket, Key}
 */
function parseStorageUrl(storageUrl) {
  try {
    // 假设URL格式: http://localhost:9000/tcm-platform-files/uploads/users/xxx/file.pdf
    const url = new URL(storageUrl);
    const pathParts = url.pathname.split('/').filter(p => p);
    
    if (pathParts.length < 2) {
      throw new Error('Invalid storage URL format');
    }
    
    const Bucket = pathParts[0];
    const Key = pathParts.slice(1).join('/');
    
    return { Bucket, Key };
  } catch (error) {
    logger.error(`[D8 SDK] Failed to parse storage URL: ${storageUrl}`, { error });
    throw new Error(`无效的存储URL: ${storageUrl}`);
  }
}

module.exports = {
  s3Client,
  uploadStream,
  deleteObject,
  objectExists,
  parseStorageUrl
};

