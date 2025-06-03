import { UnauthorizedException } from '@nestjs/common';
/**
 * 유효하지 않은 리프레시 토큰 (예: 위조, 만료 등 DB에 저장된 토큰과 불일치)
 * - 사용자는 refreshToken을 보냈지만, 유효성 검증에 실패한 경우로 서버에서 토큰을 DB에서 제거한 후, 이 에러를 반환
 * - 프론트에서 강제 로그아웃 처리 및 로그인 페이지로 이동 필요
 *
 */
export const invalidRefreshTokenException = new UnauthorizedException({
  message: '리프레시 토큰이 유효하지 않습니다.',
  errorCode: 'INVALID_REFRESH_TOKEN',
});
/**
 *  리프레시 토큰이 요청에 포함되지 않은 경우
 * - 클라이언트에서 refreshToken을 아예 전달하지 않음
 * - 주로 프론트 버그, 토큰 만료 후 자동 갱신 실패 시 발생하므로 로그인 페이지로 리디렉션 필요
 */
export const noRefreshTokenException = new UnauthorizedException({
  message: '리프레시 토큰이 필요합니다.',
  errorCode: 'NO_REFRESH_TOKEN',
});
/**
 *  리프레시 토큰 구조 자체가 잘못되어 JWT 검증 실패하여 백엔드에서 verify 과정에서 throw함.
 * - 서명이 잘못되었거나, 토큰 형식 오류, 만료된 경우 등
 * - 프론트에서 에러 메시지를 표시하고 로그인 상태 초기화 필요
 */
export const tokenVerificationFailedException = new UnauthorizedException({
  message: '리프레시 토큰 검증에 실패했습니다.',
  errorCode: 'TOKEN_VERIFICATION_FAILED',
});
