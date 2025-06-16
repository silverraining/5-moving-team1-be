import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

import type { QueryRunner as QR } from 'typeorm';

export const QueryRunner = createParamDecorator(
  (_: unknown, context: ExecutionContext): QR => {
    const req = context.switchToHttp().getRequest();

    if (!req || !req.queryRunner) {
      throw new InternalServerErrorException('QueryRunner를 찾을 수 없습니다!');
    }

    return req.queryRunner as QR;
  },
);
