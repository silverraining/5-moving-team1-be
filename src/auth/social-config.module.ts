import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

const socialValidationSchema = Joi.object({
  GOOGLE_CLIENT_ID: Joi.string().required(),
  GOOGLE_CLIENT_SECRET: Joi.string().required(),
  NAVER_CLIENT_ID: Joi.string().required(),
  NAVER_CLIENT_SECRET: Joi.string().required(),
});

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: false, // 전역이 아닌 이 모듈에서만 사용
      validationSchema: socialValidationSchema,
      envFilePath: '.env',
    }),
  ],
  exports: [ConfigModule],
})
export class SocialConfigModule {}
