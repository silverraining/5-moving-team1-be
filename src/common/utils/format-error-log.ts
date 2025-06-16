// //sentry 에러 로깅 포맷 함수
// //다음과 같은 형식으로 로그를 남김
// //[Nest] 13156  - 06/11/2025, 3:34:43 PM   ERROR [AllExceptionsFilter] [GET] /api/auth/sentry-test → 500 | Internal server error
// export function formatErrorLog(
//   method: string,
//   url: string,
//   status: number,
//   message: string,
// ): string {
//   return `[${method}] ${url} → ${status} | ${message}`;
// }
//

//에러 로그 좀 더 자세히 남기도록 수정
export function formatErrorLog({
  method,
  url,
  status,
  message,
  userId,
  stack,
}: {
  method: string;
  url: string;
  status: number;
  message: string;
  userId?: string;
  stack?: string;
}): string {
  const timestamp = new Date().toISOString();
  const userLine = userId ? ` | user: ${userId}` : '';
  const header = `[${timestamp}] [${method}] ${url} → ${status} | ${message}${userLine}`;
  return stack ? `${header}\n${stack}` : header;
}
