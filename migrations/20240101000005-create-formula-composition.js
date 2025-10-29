'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('formula_composition', {
      composition_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      formula_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'formulas',
          key: 'formula_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      medicine_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'medicines',
          key: 'medicine_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      dosage: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: '用量，如 "9g", "3-9g"'
      },
      role: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: '药物角色: 君、臣、佐、使'
      },
      processing: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: '炮制方法'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: '备注'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // 添加唯一约束和索引
    await queryInterface.addIndex('formula_composition', ['formula_id', 'medicine_id'], {
      unique: true,
      name: 'unique_formula_medicine'
    });
    await queryInterface.addIndex('formula_composition', ['formula_id']);
    await queryInterface.addIndex('formula_composition', ['medicine_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('formula_composition');
  }
};

