import { DataSource } from 'typeorm';
import { ENTITIES } from './database.entities';
import { config } from 'dotenv';

// .env 파일 로드
config();

// 통합된 DataSource 설정 (마이그레이션 용도)
export const AppDataSource = new DataSource({
  type: (process.env.DB_TYPE as 'postgres') || 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: ENTITIES,
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  ssl: { rejectUnauthorized: false },
});
