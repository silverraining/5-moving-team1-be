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
import { formatErrorLog } from '@/common/utils/format-error-log';
//error 레벨의 예외만 Sentry에 전송
//HttpException이면 logger만 찍고, 500 에러 등 일반 예외일 경우만 Sentry 전송
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    let status = 500;
    let message = 'Internal server error';

    // NestJS 내장 HttpException 처리 (BadRequestException, UnauthorizedException, NotFoundException 등)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const response = exception.getResponse();
      message =
        typeof response === 'string'
          ? response
          : (response as any)?.message || message;

      // 클라이언트 에러(4xx)는 warn 수준으로 경고 로그만 남기고 Sentry에 전송하지 않음
      const log = formatErrorLog(req.method, req.url, status, message);
      this.logger.warn(log);
      //필요 시 인증 실패 등 민감한 4xx만 Sentry 전송하려면 아래 조건 사용
      /*
      if (status === 401 || status === 403) {
        Sentry.captureException(exception);
      }
      */
    }
    // 예상치 못한 일반 Error (서버 오류)
    else {
      if (exception instanceof Error) {
        message = exception.message;
      }
      const log = formatErrorLog(req.method, req.url, status, message);
      this.logger.error(log); // 콘솔에 출력
      Sentry.captureException(exception); // Sentry에 전송

      // 클라이언트에 반환할 오류 객체 변환
      exception = new InternalServerErrorException();
    }
    //  클라이언트로 에러 응답 전송
    const responseBody =
      exception instanceof HttpException
        ? exception.getResponse()
        : { statusCode: 500, message };

    res.status(status).json(responseBody);
  }
}
