const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

/**
 * 对密码进行哈希处理
 * @param {string} password - 明文密码
 * @returns {Promise<string>} 哈希后的密码
 */
const hashPassword = async (password) => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * 同步方式对密码进行哈希处理
 * @param {string} password - 明文密码
 * @returns {string} 哈希后的密码
 */
const hashPasswordSync = (password) => {
  return bcrypt.hashSync(password, SALT_ROUNDS);
};

/**
 * 验证密码
 * @param {string} password - 明文密码
 * @param {string} hashedPassword - 哈希后的密码
 * @returns {Promise<boolean>} 是否匹配
 */
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

module.exports = {
  hashPassword,
  hashPasswordSync,
  comparePassword
};

