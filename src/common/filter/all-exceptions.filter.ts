import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as Sentry from '@sentry/node';
import { sendDiscordAlert } from '@/common/utils/discord-notifier.util';
import { formatErrorLog } from '@/common/utils/format-error-log';
// import chalk from 'chalk';
import { isString } from 'lodash';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    const { method, originalUrl: url } = req;

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = this.extractMessage(exception);
    const stack = this.getStackTrace(exception);

    const log = formatErrorLog({
      method,
      url,
      status,
      message,
      stack: undefined,
      userId: (req as any).user?.id,
    });

    this.logger.error(log);
    if (stack) {
      const trimmedStack = stack.split('\n').slice(1).join('\n'); // 첫 줄 중복 메시지 제거
      // console.error(chalk.gray(trimmedStack));
      console.error(trimmedStack);
    }

    // 클라이언트 에러(4xx)는 Sentry/Discord 전송 생략
    if (!isClientError(status)) {
      Sentry.captureException(exception);
      await sendDiscordAlert(exception, `${method} ${decodeURIComponent(url)}`);
    }

    const responseBody =
      exception instanceof HttpException
        ? exception.getResponse()
        : { statusCode: status, message };

    res.status(status).json(responseBody);
  }

  private extractMessage(exception: unknown): string {
    if (exception instanceof HttpException) {
      const response = exception.getResponse() as string | HttpException;

      if (isString(response)) {
        return response;
      } else {
        return response?.message ?? 'Internal Server Error';
      }
    }
    if (exception instanceof Error) {
      return exception.message;
    }
    return 'Unexpected error occurred';
  }

  private getStackTrace(exception: unknown): string | undefined {
    if (exception instanceof Error) {
      return exception.stack;
    }
    return undefined;
  }
}
// 4xx는 클라이언트 에러이므로 Sentry/Discord 제외
function isClientError(status: number): boolean {
  return status >= 400 && status < 500;
}
