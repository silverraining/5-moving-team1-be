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
    const req = context.switchToHttp().getRequest();

    if (!req || !req.user || !req.user.sub) {
      throw new UnauthorizedException('사용자 정보를 찾을 수 없습니다!');
    }

    const userInfo: UserInfo = {
      sub: req.user.sub, // 사용자 ID
      role: req.user.role, // 사용자 역할
    };

    return userInfo;
  },
);
