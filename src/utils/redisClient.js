const redis = require('redis');
const config = require('../../config');
const logger = require('./logger');

class RedisClient {
  constructor() {
    this.client = null;
    this.connected = false;
  }

  /**
   * 连接 Redis
   */
  async connect() {
    if (this.connected) {
      return this.client;
    }

    try {
      this.client = redis.createClient({
        socket: {
          host: config.redis.host,
          port: config.redis.port
        },
        password: config.redis.password || undefined,
        database: config.redis.database || 0
      });

      this.client.on('error', (err) => {
        logger.error('Redis Client Error', { error: err.message });
      });

      this.client.on('connect', () => {
        logger.info('Redis Client Connected');
      });

      this.client.on('ready', () => {
        logger.info('Redis Client Ready');
        this.connected = true;
      });

      this.client.on('end', () => {
        logger.info('Redis Client Disconnected');
        this.connected = false;
      });

      await this.client.connect();

      return this.client;
    } catch (error) {
      logger.error('Failed to connect to Redis', { error: error.message });
      throw error;
    }
  }

  /**
   * 获取 Redis 客户端
   */
  async getClient() {
    if (!this.connected) {
      await this.connect();
    }
    return this.client;
  }

  /**
   * 设置键值对（带过期时间）
   * @param {string} key - 键
   * @param {string} value - 值
   * @param {number} ttl - 过期时间（秒）
   */
  async set(key, value, ttl) {
    const client = await this.getClient();
    if (ttl) {
      await client.setEx(key, ttl, value);
    } else {
      await client.set(key, value);
    }
  }

  /**
   * 获取值
   * @param {string} key - 键
   * @returns {Promise<string|null>}
   */
  async get(key) {
    const client = await this.getClient();
    return await client.get(key);
  }

  /**
   * 删除键
   * @param {string} key - 键
   */
  async del(key) {
    const client = await this.getClient();
    await client.del(key);
  }

  /**
   * 检查键是否存在
   * @param {string} key - 键
   * @returns {Promise<boolean>}
   */
  async exists(key) {
    const client = await this.getClient();
    const result = await client.exists(key);
    return result === 1;
  }

  /**
   * 断开连接
   */
  async disconnect() {
    if (this.client && this.connected) {
      await this.client.quit();
      this.connected = false;
    }
  }
}

module.exports = new RedisClient();

