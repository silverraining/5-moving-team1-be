import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { envVariableKeys } from '@/common/const/env.const';
import { ENTITIES } from './database.entities';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: configService.get<string>(envVariableKeys.dbType) as 'postgres',
        host: configService.get<string>(envVariableKeys.dbHost),
        port: configService.get<number>(envVariableKeys.dbPort),
        username: configService.get<string>(envVariableKeys.dbUsername),
        password: configService.get<string>(envVariableKeys.dbPassword),
        database: configService.get<string>(envVariableKeys.dbDatabase),
        entities: ENTITIES,
        synchronize:
          configService.get<string>(envVariableKeys.dbSynchronize) === 'true',
        ssl: { rejectUnauthorized: false },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
