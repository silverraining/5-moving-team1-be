import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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

  //Swagger 세팅
  const config = new DocumentBuilder()
    .setTitle('Moviong API') // 문서 제목
    .setDescription('이사 관련 서비스 앱 개발자를 위한 Moviong API 문서입니다.') // 설명
    .setVersion('1.0') // 버전
    .addBearerAuth() // JWT 인증 적용할 경우
    .build();

  // Swagger 문서 생성
  const document = SwaggerModule.createDocument(app, config);

  // Swagger UI 경로 설정 (/api-docs 등)
  SwaggerModule.setup('api-docs', app, document);

  // 응답에서 Exclude된 필드 안보이게 하기
  // ex) BaseTable
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  await app.listen(process.env.PORT ?? 3000);

  const port = process.env.PORT || 3000;
  const lines = [];
  console.log(`
 🚀 서버 실행 완료!                                         
 🔗 Localhost:       http://localhost:5000                 
 📘 Swagger 문서:    http://localhost:5000/api-docs`);
}

void bootstrap();
