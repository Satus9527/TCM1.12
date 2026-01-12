'use strict';

const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const users = [
      {
        user_id: uuidv4(),
        username: 'health_user',
        password_hash: bcrypt.hashSync('password123', 10),
        role: 'health_follower',
        email: 'health@example.com',
        phone: '13800138000'
      },
      {
        user_id: uuidv4(),
        username: 'student_wang',
        password_hash: bcrypt.hashSync('password123', 10),
        role: 'student',
        email: 'student@example.com',
        phone: '13800138001'
      },
      {
        user_id: uuidv4(),
        username: 'teacher_li',
        password_hash: bcrypt.hashSync('password123', 10),
        role: 'teacher',
        email: 'teacher@example.com',
        phone: '13800138002'
      }
    ];

    await queryInterface.bulkInsert('users', users, {
      ignoreDuplicates: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', null, {});
  }
};

