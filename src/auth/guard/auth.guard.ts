import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Public } from '../decorator/public.decorator';
import { Request } from 'express';
import { JwtPayload } from 'src/common/types/payload.type';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    /// 요청에서 user 객체가 있는지 확인
    const req: { user: JwtPayload } = context.switchToHttp().getRequest();
    const isPublic = this.reflector.get(Public, context.getHandler());

    if (isPublic) {
      return true;
    }

    if (!req.user || req.user.type !== 'access') {
      return false;
    }
    return true;
  }
}
