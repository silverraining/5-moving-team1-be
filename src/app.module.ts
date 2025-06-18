import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { UserModule } from './user/user.module';
import { NotificationModule } from './notification/notification.module';
import { MoverProfileModule } from './mover-profile/mover-profile.module';
import { CustomerProfileModule } from './customer-profile/customer-profile.module';
import { LikeModule } from './like/like.module';
import { EstimateRequestModule } from './estimate-request/estimate-request.module';
import { EstimateOfferModule } from './estimate-offer/estimate-offer.module';
import { ReviewModule } from './review/review.module';
import { AuthModule } from './auth/auth.module';
import { AuthGuard } from './auth/guard/auth.guard';
import { BearerTokenMiddleware } from './auth/middleware/bearer-token.middleware';
import { ForbiddenExceptionFilter } from './common/filter/forbidden.filter';
import { RbacGuard } from './auth/guard/rbac.guard';
import { QueryFailedExceptionFilter } from './common/filter/query-failed.filter';
import { ResponseTimeInterceptor } from './common/interceptor/response-time.interceptor';
import { S3Module } from './s3/s3.module';
import { DatabaseModule } from './database/database.module';
import { databaseValidationSchema } from './database/database.config';
import { TestErrorController } from './common/utils/test-error.controller';
import { AppController } from './app.controller';
import { EventEmitterModule } from '@nestjs/event-emitter';

const appValidationSchema = Joi.object({
  // 애플리케이션 실행 환경 설정 ('dev' 또는 'prod'만 허용)
  ENV: Joi.string().valid('dev', 'prod').required(),

  // bcrypt 관련 환경 변수
  HASH_ROUNDS: Joi.number().required(),

  // 토큰 관련 환경 변수
  ACCESS_TOKEN_SECRET: Joi.string().required(),
  REFRESH_TOKEN_SECRET: Joi.string().required(),

  // 소셜 로그인 관련 환경 변수
  // NAVER_CLIENT_ID: Joi.string().required(),
  // NAVER_CLIENT_SECRET: Joi.string().required(),
}).concat(databaseValidationSchema);
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: appValidationSchema,
    }),
    EventEmitterModule.forRoot(),
    // 핵심 모듈
    DatabaseModule,
    AuthModule,

    // 비지니스 모듈
    UserModule,
    NotificationModule,
    MoverProfileModule,
    CustomerProfileModule,
    LikeModule,
    EstimateRequestModule,
    EstimateOfferModule,
    ReviewModule,
    AuthModule,
    S3Module,
  ],
  controllers: [AppController, TestErrorController],
  providers: [
    {
      provide: 'APP_GUARD',
      useClass: AuthGuard,
    },
    {
      provide: 'APP_GUARD',
      useClass: RbacGuard,
    },
    {
      provide: 'APP_INTERCEPTOR',
      useClass: ResponseTimeInterceptor,
    },
    {
      provide: 'APP_FILTER',
      useClass: ForbiddenExceptionFilter,
    },
    {
      provide: 'APP_FILTER',
      useClass: QueryFailedExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(BearerTokenMiddleware)
      .exclude(
        { path: 'auth/register', method: RequestMethod.POST }, /// 회원가입 제외
        { path: 'auth/login', method: RequestMethod.POST }, /// 로컬 로그인 제외
        { path: 'auth/login/:social', method: RequestMethod.GET }, /// 모든 소셜 로그인 (:social 매개변수 사용) 제외
        { path: 'auth/callback/:social', method: RequestMethod.GET }, /// 모든 소셜 콜백 (:social 매개변수 사용) 제외
      )
      .forRoutes('*'); /// 모든 라우트에 미들웨어 적용
  }
}
