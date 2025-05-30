import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

type QueryFailedErrorWithDetail = QueryFailedError & {
  detail?: string;
};

@Catch(QueryFailedError)
export class QueryFailedExceptionFilter implements ExceptionFilter {
  catch(exception: QueryFailedErrorWithDetail, host: ArgumentsHost) {
    const ctx = host.switchToHttp(); // context
    const res = ctx.getResponse(); // response
    const req = ctx.getRequest(); // request

    let status = 400; // Bad Request
    let message = '데이터 베이스 에러 발생!';

    if (exception.message.includes('duplicate key')) {
      status = 409; // Conflict
      message = '이미 존재하는 데이터입니다';
    }

    console.error(
      'QueryFailedError:',
      exception.message,
      exception.detail,
      exception.stack,
    );

    res.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: req.url,
      message,
    });
  }
}
