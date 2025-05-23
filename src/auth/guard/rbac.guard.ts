import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from 'src/user/entities/user.entity';
import { RBAC } from '../decorator/rbac.decorator';
import { JwtPayload } from 'src/common/types/payload.type';

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const role = this.reflector.get<Role>(RBAC, context.getHandler());

    const req: { user: JwtPayload } = context.switchToHttp().getRequest();
    const user = req.user;

    if (!user) {
      return false;
    }

    return user.role === role;
  }
}
