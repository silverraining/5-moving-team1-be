//sentry 에러 로깅 포맷 함수
//다음과 같은 형식으로 로그를 남김
//[Nest] 13156  - 06/11/2025, 3:34:43 PM   ERROR [AllExceptionsFilter] [GET] /api/auth/sentry-test → 500 | Internal server error
export function formatErrorLog(
  method: string,
  url: string,
  status: number,
  message: string,
): string {
  return `[${method}] ${url} → ${status} | ${message}`;
}
