import {
  CallHandler,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class ResponseTimeInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const requestTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const responseTime = Date.now();
        const diff = responseTime - requestTime; /// ms

        let logMessage = `[${request.method} ${request.path}] ${diff}ms`;

        if (diff > 10000) {
          logMessage = '!!!TIME OUT!!!' + logMessage;
          console.log(logMessage);
          throw new InternalServerErrorException(
            '응답 시간이 10초를 초과하였습니다!',
          );
        }

        console.log(logMessage);
      }),
    );
  }
}
