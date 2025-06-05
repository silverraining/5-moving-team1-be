// src/seed/index.ts

import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { seedEstimateOffers } from './estimate-offer.seed';
import { ENTITIES } from '@/database/database.entities';

config();

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: ENTITIES,
  synchronize: false,
  ssl: { rejectUnauthorized: false },
});

const runSeeds = async () => {
  try {
    console.log('🟡 DB 연결 중...');
    await dataSource.initialize();

    console.log('📦 견적 제안 시드 실행 중...');
    await seedEstimateOffers(dataSource);

    console.log('✅ 시드 완료');
  } catch (err) {
    console.error('❌ 시드 실패:', err);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
};

runSeeds();
