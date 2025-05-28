import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from 'src/user/entities/user.entity';
import { RBAC } from '../decorator/rbac.decorator';
import { Public } from '../decorator/public.decorator';

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const handler = context.getHandler(); // 	현재 실행 중인 메서드(핸들러)를 반환
    const controller = context.getClass(); //	현재 실행 중인 컨트롤러 클래스를 반환

    const isPublicOnMethod = this.reflector.get<boolean>(Public, handler); // 핸들러에서 Public 데코레이터를 찾음
    const isPublicOnClass = this.reflector.get<boolean>(Public, controller); // 컨트롤러에서 Public 데코레이터를 찾음

    if (isPublicOnMethod || isPublicOnClass) return true;

    let role = this.reflector.get<Role>(RBAC, handler); // 핸들러에서 RBAC 데코레이터를 찾음
    if (!role) role = this.reflector.get<Role>(RBAC, controller); // 핸들러에서 찾지 못하면 컨트롤러에서 찾음
    if (!role) return true; // 둘 다 없으면 전역이므로 접근 허용

    const req = context.switchToHttp().getRequest();
    const user = req.user;

    if (!user) return false;

    return user.role === role;
  }
}
