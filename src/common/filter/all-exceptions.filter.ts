import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as Sentry from '@sentry/node';
import { sendDiscordAlert } from '@/common/utils/discord-notifier.util';
import { formatErrorLog } from '@/common/utils/format-error-log';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp(); //현재 실행 중인 context(실행 환경)-  HTTP 요청을 처리
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    const { method, url } = req;

    let status = 500;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      //HttpException - NestJS 내장 예외 (클라이언트 오류)
      status = exception.getStatus();
      const response = exception.getResponse();
      message =
        typeof response === 'string'
          ? response
          : (response as any)?.message || message;
      //클라이언트가 잘못 보낸 요청이면 로그만 남기고 Sentry, Discord 전송 안 함.
      const log = formatErrorLog(method, url, status, message);
      this.logger.warn(log);

      if (!isClientError(status)) {
        Sentry.captureException(exception);
        await sendDiscordAlert(exception, `${method} ${url}`);
      }
    } else {
      // Unknown error
      if (exception instanceof Error) {
        //Error - 예기치 못한 일반 오류 (서버 오류)
        message = exception.message;
      }

      const log = formatErrorLog(method, url, status, message);
      this.logger.error(log);

      Sentry.captureException(exception); //Sentry로 에러 전송
      await sendDiscordAlert(exception, `${method} ${url}`); //Discord Webhook으로 알림 전송
      exception = new InternalServerErrorException(); // 숨김 처리
    }

    const responseBody =
      exception instanceof HttpException
        ? exception.getResponse()
        : { statusCode: status, message };

    res.status(status).json(responseBody); //클라이언트로 JSON 에러 응답
  }
}

// 4xx는 클라이언트 에러이므로 Sentry/Discord 제외
function isClientError(status: number) {
  return status >= 400 && status < 500;
}
