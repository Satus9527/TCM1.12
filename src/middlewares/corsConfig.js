const cors = require('cors');

/**
 * CORS 配置
 * 根据环境配置允许的源
 */
const corsOptions = {
  // 允许的源
  origin: (origin, callback) => {
    // 允许的源列表
    const allowedOrigins = [
      'http://localhost:8080',
      'http://localhost:3000',
      'http://localhost:5173',  // Vite开发服务器
      'http://127.0.0.1:8080',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173'
    ];

    // 在生产环境中添加实际的前端域名
    if (process.env.FRONTEND_URL) {
      allowedOrigins.push(process.env.FRONTEND_URL);
    }

    // 允许没有 origin 的请求（例如移动应用、Postman）
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },

  // 允许的 HTTP 方法
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],

  // 允许的请求头
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],

  // 允许发送凭证（cookies）
  credentials: true,

  // 预检请求的缓存时间（秒）
  maxAge: 86400, // 24小时

  // 暴露给客户端的响应头
  exposedHeaders: ['X-Total-Count', 'X-Page-Count']
};

module.exports = cors(corsOptions);

