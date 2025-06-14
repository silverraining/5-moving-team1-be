import './sentry/instrument';
import { AllExceptionsFilter } from './common/filter/all-exceptions.filter';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000', // 프론트엔드 주소
    credentials: true, // 쿠키, 인증 헤더 포함 허용
  });

  // API 라우트에만 prefix 적용
  app.setGlobalPrefix('api', {
    exclude: ['/'], // 루트 경로는 prefix에서 제외
  });

  //유효성 파이프 전역 설정
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO에 없는 속성은 자동으로 제거
      forbidNonWhitelisted: true, // DTO에 없는 속성이 있으면 에러를 발생
      transform: true, // DTO의 enum으로 자동 변환
      transformOptions: {
        enableImplicitConversion: true, // string 값을 DTO의 number 등으로 자동 변환
      },
    }),
  );

  //  Sentry 필터 등록
  app.useGlobalFilters(new AllExceptionsFilter());

  // ClassSerializer 적용 (응답 데이터에서 Exclude 필드 제거 등)
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  //Swagger 세팅
  const config = new DocumentBuilder()
    .setTitle('Moving API') // 문서 제목
    .setDescription('이사 관련 서비스 앱 개발자를 위한 Moving API 문서입니다.') // 설명
    .setVersion('1.0') // 버전
    .addBearerAuth() // JWT 인증 적용할 경우
    .build();

  // Swagger 문서 생성
  const document = SwaggerModule.createDocument(app, config);

  // Swagger UI 경로 설정 (/api-docs 등)
  SwaggerModule.setup('api-docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`
 🚀 서버 실행 완료!                                         
 🔗 Localhost:       http://localhost:${port}                 
 📘 Swagger 문서:    http://localhost:${port}/api-docs`);
}

void bootstrap();
