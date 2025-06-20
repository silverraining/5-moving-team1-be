import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Role } from '../entities/user.entity';

export type UserInfo = {
  sub: string; // 사용자 ID
  role: Role; // 사용자 역할 (예: Role.CUSTOMER, Role.MOVER 등)
};

export const UserInfo = createParamDecorator(
  (_: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const { user, isPublic } = request;

    // 2. 토큰은 있지만 사용자 정보가 불완전한 경우: 예외 발생
    if (!request || !user || !user.sub) {
      // 1. 비회원 접근 허용 (예: @Public() 적용된 라우트)
      if (isPublic) {
        return {
          sub: 'anonymous',
          role: Role.GUEST, // 비회원 사용자
        };
      }
      throw new UnauthorizedException('사용자 정보가 없습니다.');
    }

    // 3. 인증된 사용자 정보 반환
    return {
      sub: user.sub, // 사용자 ID
      role: user.role, // 사용자 역할
    };
  },
);
