// PM2 生态系统配置文件
// 用于生产环境进程管理

module.exports = {
  apps: [
    {
      // 应用名称
      name: "tcm-backend",
      
      // 启动脚本路径
      script: "src/app.js",
      
      // 生产环境不监听文件变化
      watch: false,
      
      // 环境变量
      env: {
        NODE_ENV: "production"
      },
      
      // 进程数（根据服务器 CPU 核心数调整）
      instances: 1,
      // 如需启用集群模式，可以使用:
      // instances: "max"  // 自动根据 CPU 核心数创建进程
      
      // 自动重启配置
      autorestart: true,
      restart_delay: 5000,      // 重启延迟 5 秒
      max_restarts: 10,         // 最多重启 10 次
      min_uptime: "10s",        // 正常运行 10 秒才认为是稳定启动
      
      // 日志配置
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,         // 合并实例日志
      
      // 性能监控
      max_memory_restart: "500M",  // 内存超过 500M 自动重启
      
      // 实例监控
      kill_timeout: 5000,       // 优雅关闭超时时间
      
      // 高级配置
      listen_timeout: 10000,    // 监听超时 10 秒
      shutdown_with_message: true  // 关闭时发送消息
    }
  ]
};

