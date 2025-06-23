import { ERDBuilder } from 'typeorm-erd';
import { DataSource } from 'typeorm';
import { ENTITIES } from '../src/database/database.entities';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';

// .env 파일 로드
config();

const AppDataSource = new DataSource({
  type: (process.env.DB_TYPE as 'postgres') || 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: ENTITIES,
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  ssl: { rejectUnauthorized: false },
});

const main = async () => {
  const erd = new ERDBuilder('mermaid', AppDataSource);
  await erd.initialize();
  const erdText = await erd.render();

  console.info(erdText);

  // src/database/erd 폴더에 저장
  const erdDir = join(__dirname, '..', 'src', 'database', 'erd');
  mkdirSync(erdDir, { recursive: true });

  const erdFilePath = join(erdDir, 'erd.mmd');
  writeFileSync(erdFilePath, erdText);
  console.log(`ERD가 ${erdFilePath} 파일로 저장되었습니다.`);
};

main();
