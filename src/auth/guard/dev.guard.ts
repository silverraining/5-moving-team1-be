import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DEV_MODE } from '../decorator/dev.decorator';

@Injectable()
export class DevGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // @Dev() 데코레이터가 있는지 확인
    const isDevMode = this.reflector.get<boolean>(
      DEV_MODE,
      context.getHandler(),
    );

    if (!isDevMode) {
      return false;
    }

    // 환경 변수 체크
    const isDevelopment =
      process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';
    const isDevEnv = process.env.ENV === 'dev';

    // 개발 환경이면서 @Dev() 데코레이터가 있는 경우만 허용
    return isDevelopment && isDevEnv;
  }
}
