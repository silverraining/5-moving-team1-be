import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Public } from '../decorator/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    /// 요청에서 user 객체가 있는지 확인
    const request = context.switchToHttp().getRequest();
    const isPublic = this.reflector.get(Public, context.getHandler());

    if (isPublic) {
      return true;
    }

    if (!request.user || request.user.type !== 'access') {
      throw new UnauthorizedException('액세스 토큰이 필요합니다.');
      // return false;
    }
    return true;
  }
}
