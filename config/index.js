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
  
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  }
};

module.exports = config;

