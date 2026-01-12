'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_simulations', {
      simulation_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
        comment: '模拟方案ID'
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        comment: '用户ID',
        references: {
          model: 'users',
          key: 'user_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      name: {
        type: Sequelize.STRING(200),
        allowNull: false,
        comment: '方案名称'
      },
      composition_data: {
        type: Sequelize.JSON,
        allowNull: false,
        comment: '配方组成数据（JSON格式）'
      },
      ai_analysis_data: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'AI分析结果数据（JSON格式）'
      },
      user_notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: '用户备注'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: '创建时间'
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
        comment: '更新时间'
      }
    }, {
      // 在 createTable 选项中直接定义索引
      indexes: [
        {
          fields: ['user_id', 'created_at'],
          name: 'idx_simulations_user_time'  // 改名避免冲突
        }
      ]
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('user_simulations');
  }
};

