import 'dotenv/config';
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.SENTRY_ENV || 'development', // 환경 설정
  release: process.env.SENTRY_RELEASE || 'moving-api@dev', // 버전 식별
  sendDefaultPii: process.env.SENTRY_SEND_PII === 'true', // 사용자의 IP, 쿠키 등 PII 데이터 전송 허용 여부 -> .env 설정으로 기본 false이고 로깅 필요시 true로 설정
  tracesSampleRate: 1.0,
  // debug: true,
});
// Sentry.captureException(new Error('수동 테스트 에러입니다!'));
// Sentry.flush(2000).then(() => {
//   console.log('Sentry 전송 완료');
// });
