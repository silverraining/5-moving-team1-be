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
    // 1. Public 데코레이터 확인
    const isPublic = this.reflector.getAllAndOverride<boolean>(Public, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();

    if (isPublic) {
      request.isPublic = isPublic; // request에 플래그를 설정해 다음 단계에서 참고 가능하도록 함
      return true; // 그 후에 접근 허용
    }

    // 2. 사용자 인증 여부 확인 (access 토큰이 있는지)
    if (!request.user || request.user.type !== 'access') {
      throw new UnauthorizedException('액세스 토큰이 필요합니다.');
    }

    // 3. 인증된 사용자일 경우 요청 허용
    return true;
  }
}
