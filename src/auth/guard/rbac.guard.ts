import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from 'src/user/entities/user.entity';
import { RBAC } from '../decorator/rbac.decorator';

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const { isPublic, user } = request; // 전역 authGuard에서 받은 request isPublic 속성 받아오기

    // 1. @Public 데코레이터가 있는 경우: 권한 검사 없이 접근 허용
    if (isPublic) {
      return true;
    }

    // 2. @RBAC 데코레이터에서 요구하는 역할(role) 조회
    const role = this.reflector.getAllAndOverride<Role>(RBAC, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 3. 접근 제어가 명시되지 않은 경우: 기본적으로 접근 허용
    if (!role) return true;

    // 4. 사용자 정보가 없으면 접근 거부
    if (!user) return false;

    // 5. 사용자 역할이 요구되는 역할과 일치하는 경우 접근 허용
    return user.role === role;
  }
}
