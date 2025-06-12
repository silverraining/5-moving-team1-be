import { Controller, Get } from '@nestjs/common';

@Controller('test-error')
export class TestErrorController {
  @Get('throw')
  throwError() {
    throw new Error('🔥 웹훅 알림 테스트');
  }
}
