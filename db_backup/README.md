# 数据库备份目录

此目录用于存储数据库备份文件。

## 创建备份

使用以下命令创建数据库备份：

```bash
mysqldump -u root -p tcm_platform > db_backup/backup_$(date +%Y%m%d_%H%M%S).sql
```

或者使用环境变量：

```bash
mysqldump -u ${DB_USER} -p${DB_PASSWORD} ${DB_NAME} > db_backup/backup.sql
```

## 恢复备份

使用以下命令恢复数据库：

```bash
mysql -u root -p tcm_platform < db_backup/backup.sql
```

或者使用 npm 脚本（在 package.json 中定义）：

```bash
npm run db:restore
```

## 注意事项

1. 备份文件可能包含敏感数据，请勿提交到版本控制系统
2. 定期创建备份，特别是在重要更新前
3. 建议在生产环境中使用自动化备份工具
4. 保留多个版本的备份文件

## 备份策略建议

- **开发环境**: 每次重大更改前备份
- **测试环境**: 每天备份一次
- **生产环境**: 
  - 每小时增量备份
  - 每天完整备份
  - 保留至少 30 天的备份

