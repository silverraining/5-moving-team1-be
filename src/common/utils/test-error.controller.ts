import { Controller, Get } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

@Controller('test-error')
export class TestErrorController {
  @Get('throw')
  @ApiExcludeEndpoint() // Swagger 문서에서 숨김
  throwError() {
    throw new Error('🔥 웹훅 알림 테스트');
  }
}
