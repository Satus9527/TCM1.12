'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const config = require('../../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// 创建 Sequelize 实例
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    pool: dbConfig.pool
  }
);

const db = {};

// 自动加载当前目录下的所有模型文件
fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== 'index.js' &&
      file.slice(-3) === '.js'
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// 定义模型关联
// Medicine 和 Formula 通过 FormulaComposition 多对多关联
// 注意：这些关联已经在各自的模型文件中定义（Medicine.js 和 Formula.js）
// 但为了兼容性，这里也保留一份
if (db.Medicine && db.Formula && db.FormulaComposition) {
  db.Medicine.belongsToMany(db.Formula, {
    through: db.FormulaComposition,
    foreignKey: 'medicine_id',
    otherKey: 'formula_id',
    as: 'formulas'  // 添加别名，与 Medicine.js 中的定义保持一致
  });

  db.Formula.belongsToMany(db.Medicine, {
    through: db.FormulaComposition,
    foreignKey: 'formula_id',
    otherKey: 'medicine_id',
    as: 'medicines'
  });
}

// 用户与收藏的关联
if (db.User && db.UserCollection) {
  db.User.hasMany(db.UserCollection, { foreignKey: 'user_id' });
  db.UserCollection.belongsTo(db.User, { foreignKey: 'user_id' });
  
  // 收藏与方剂的关联（灵活关联，支持content_type）
  if (db.Formula) {
    db.UserCollection.belongsTo(db.Formula, {
      foreignKey: 'content_id',
      targetKey: 'formula_id',
      constraints: false, // 不创建外键约束（因为用于多种类型）
      as: 'formula'
    });
  }
}

// 用户与模拟方案的关联
if (db.User && db.UserSimulation) {
  db.User.hasMany(db.UserSimulation, { foreignKey: 'user_id' });
  db.UserSimulation.belongsTo(db.User, { foreignKey: 'user_id' });
}

// 用户与文件的关联
if (db.User && db.UserFile) {
  db.User.hasMany(db.UserFile, { foreignKey: 'user_id' });
  db.UserFile.belongsTo(db.User, { foreignKey: 'user_id' });
}

// 导出 sequelize 实例和 Sequelize 类
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
