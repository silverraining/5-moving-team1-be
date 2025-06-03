import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { envVariableKeys } from './common/const/env.const';
import { UserModule } from './user/user.module';
import { NotificationModule } from './notification/notification.module';
import { MoverProfileModule } from './mover-profile/mover-profile.module';
import { CustomerProfileModule } from './customer-profile/customer-profile.module';
import { LikeModule } from './like/like.module';
import { EstimateRequestModule } from './estimate-request/estimate-request.module';
import { EstimateOfferModule } from './estimate-offer/estimate-offer.module';
import { ReviewModule } from './review/review.module';
import { User } from './user/entities/user.entity';
import { Notification } from './notification/entities/notification.entity';
import { MoverProfile } from './mover-profile/entities/mover-profile.entity';
import { MoverProfileView } from './mover-profile/view/mover-profile.view';
import { CustomerProfile } from './customer-profile/entities/customer-profile.entity';
import { Like } from './like/entities/like.entity';
import { EstimateRequest } from './estimate-request/entities/estimate-request.entity';
import { Review } from './review/entities/review.entity';
import { EstimateOffer } from './estimate-offer/entities/estimate-offer.entity';
import { AuthModule } from './auth/auth.module';
import { AuthGuard } from './auth/guard/auth.guard';
import { BearerTokenMiddleware } from './auth/middleware/bearer-token.middleware';
import { ForbiddenExceptionFilter } from './common/filter/forbidden.filter';
import { RbacGuard } from './auth/guard/rbac.guard';
import { QueryFailedExceptionFilter } from './common/filter/query-failed.filter';
import { ResponseTimeInterceptor } from './common/interceptor/response-time.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        ENV: Joi.string().valid('dev', 'prod').required(),
        DB_TYPE: Joi.string().valid('postgres').required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_DATABASE: Joi.string().required(),
        HASH_ROUNDS: Joi.number().required(),
        ACCESS_TOKEN_SECRET: Joi.string().required(),
        REFRESH_TOKEN_SECRET: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: configService.get<string>(envVariableKeys.dbType) as 'postgres',
        host: configService.get<string>(envVariableKeys.dbHost),
        port: configService.get<number>(envVariableKeys.dbPort),
        username: configService.get<string>(envVariableKeys.dbUsername),
        password: configService.get<string>(envVariableKeys.dbPassword),
        database: configService.get<string>(envVariableKeys.dbDatabase),
        entities: [
          User,
          Notification,
          MoverProfile,
          MoverProfileView,
          CustomerProfile,
          Like,
          EstimateRequest,
          EstimateOffer,
          Review,
        ], // 엔티티 등록
        synchronize: true,
        ssl: { rejectUnauthorized: false },
      }),
      inject: [ConfigService],
    }),
    UserModule,
    NotificationModule,
    MoverProfileModule,
    CustomerProfileModule,
    LikeModule,
    EstimateRequestModule,
    EstimateOfferModule,
    ReviewModule,
    AuthModule,
  ],
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
        { path: 'auth/login/local', method: RequestMethod.POST }, /// 로그인 제외
        { path: 'auth/register', method: RequestMethod.POST }, /// 회원가입 제외
      )
      .forRoutes('*'); /// 모든 라우트에 미들웨어 적용
  }
}
