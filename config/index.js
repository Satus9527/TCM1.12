require('dotenv').config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tcm_platform',
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    database: parseInt(process.env.REDIS_DATABASE, 10) || 0
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-this',
    accessExpiration: process.env.JWT_ACCESS_EXPIRATION || '15m',
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d'
  },
  
  aiService: {
    recommendUrl: process.env.E1_RECOMMEND_URL || 'http://localhost:5001/recommend/formula',
    analyzeUrl: process.env.E1_ANALYZE_URL || 'http://localhost:5001/analyze/composition',
    healthUrl: process.env.E1_HEALTH_URL || 'http://localhost:5001/health',
    timeout: parseInt(process.env.E1_TIMEOUT_MS, 10) || 5000
  },
  
  // D8 对象存储配置（AWS S3兼容）
  d8: {
    endpoint: process.env.D8_ENDPOINT || 'http://localhost:9000',
    region: process.env.D8_REGION || 'us-east-1',
    bucket: process.env.D8_BUCKET || 'tcm-platform-files',
    accessKeyId: process.env.D8_ACCESS_KEY_ID || 'minioadmin',
    secretAccessKey: process.env.D8_SECRET_ACCESS_KEY || 'minioadmin',
    forcePathStyle: process.env.D8_FORCE_PATH_STYLE === 'true' || true // MinIO需要
  },
  
  // 文件上传配置
  upload: {
    maxFileSize: parseInt(process.env.UPLOAD_MAX_FILE_SIZE, 10) || 50 * 1024 * 1024, // 默认50MB
    allowedMimeTypes: (process.env.UPLOAD_ALLOWED_MIME_TYPES || 
      'application/pdf,image/jpeg,image/png,image/gif,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,video/mp4'
    ).split(',').map(type => type.trim()),
    allowedExtensions: (process.env.UPLOAD_ALLOWED_EXTENSIONS || 
      '.pdf,.jpg,.jpeg,.png,.gif,.ppt,.pptx,.doc,.docx,.mp4'
    ).split(',').map(ext => ext.trim().toLowerCase())
  },
  
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  }
};

module.exports = config;

