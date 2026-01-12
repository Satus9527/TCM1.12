/**
 * 文件处理工具函数
 */

const path = require('path');

/**
 * 清理文件名，移除潜在危险字符和路径遍历
 * @param {string} fileName - 原始文件名
 * @returns {string} - 清理后的文件名
 */
function sanitizeFileName(fileName) {
  if (!fileName || typeof fileName !== 'string') {
    return 'unnamed_file';
  }

  // 移除路径分隔符（防止路径遍历攻击）
  let sanitized = fileName.replace(/[/\\]/g, '_');
  
  // 移除控制字符和特殊字符
  sanitized = sanitized.replace(/[\x00-\x1f\x80-\x9f]/g, '');
  
  // 移除可能导致问题的字符
  sanitized = sanitized.replace(/[<>:"|?*]/g, '');
  
  // 移除开头的点（隐藏文件）
  sanitized = sanitized.replace(/^\.+/, '');
  
  // 移除多余的空格
  sanitized = sanitized.trim().replace(/\s+/g, '_');
  
  // 确保文件名不为空
  if (!sanitized || sanitized.length === 0) {
    sanitized = 'unnamed_file';
  }
  
  // 限制文件名长度（保留扩展名）
  const maxLength = 255;
  if (sanitized.length > maxLength) {
    const ext = path.extname(sanitized);
    const baseName = path.basename(sanitized, ext);
    const truncatedBaseName = baseName.substring(0, maxLength - ext.length - 1);
    sanitized = truncatedBaseName + ext;
  }
  
  return sanitized;
}

/**
 * 验证文件扩展名是否在允许列表中
 * @param {string} fileName - 文件名
 * @param {Array<string>} allowedExtensions - 允许的扩展名列表（如 ['.pdf', '.jpg']）
 * @returns {boolean} - 是否允许
 */
function isAllowedExtension(fileName, allowedExtensions) {
  if (!fileName || !Array.isArray(allowedExtensions) || allowedExtensions.length === 0) {
    return false;
  }
  
  const ext = path.extname(fileName).toLowerCase();
  return allowedExtensions.some(allowed => allowed.toLowerCase() === ext);
}

/**
 * 验证文件MIME类型是否在允许列表中
 * @param {string} mimeType - MIME类型
 * @param {Array<string>} allowedMimeTypes - 允许的MIME类型列表
 * @returns {boolean} - 是否允许
 */
function isAllowedMimeType(mimeType, allowedMimeTypes) {
  if (!mimeType || !Array.isArray(allowedMimeTypes) || allowedMimeTypes.length === 0) {
    return false;
  }
  
  return allowedMimeTypes.some(allowed => 
    allowed.toLowerCase() === mimeType.toLowerCase()
  );
}

/**
 * 格式化文件大小为人类可读格式
 * @param {number} bytes - 字节数
 * @returns {string} - 格式化后的大小（如 "1.5 MB"）
 */
function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + units[i];
}

/**
 * 生成唯一的文件名（保留原始扩展名）
 * @param {string} originalFileName - 原始文件名
 * @param {string} prefix - 前缀（通常是UUID）
 * @returns {string} - 唯一文件名
 */
function generateUniqueFileName(originalFileName, prefix) {
  const ext = path.extname(originalFileName);
  const sanitizedOriginal = sanitizeFileName(path.basename(originalFileName, ext));
  return `${prefix}_${sanitizedOriginal}${ext}`;
}

module.exports = {
  sanitizeFileName,
  isAllowedExtension,
  isAllowedMimeType,
  formatFileSize,
  generateUniqueFileName
};

