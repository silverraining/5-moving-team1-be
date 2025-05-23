import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO에 없는 속성은 자동으로 제거
      forbidNonWhitelisted: true, // DTO에 없는 속성이 있으면 에러를 발생
      transformOptions: {
        enableImplicitConversion: true, // string 값을 DTO의 number 등으로 자동 변환
      },
    }),
  );

  // 응답에서 Exclude된 필드 안보이게 하기
  // ex) BaseTable
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
