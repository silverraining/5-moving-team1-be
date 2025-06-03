const env = 'ENV';
const dbType = 'DB_TYPE';
const dbHost = 'DB_HOST';
const dbPort = 'DB_PORT';
const dbUsername = 'DB_USERNAME';
const dbPassword = 'DB_PASSWORD';
const dbDatabase = 'DB_DATABASE';
const hashRounds = 'HASH_ROUNDS';
const accessToken = 'ACCESS_TOKEN_SECRET';
const refreshToken = 'REFRESH_TOKEN_SECRET';
// 토큰 만료 시간 관련 키 추가
const accessTokenExpirationDev = 'ACCESS_TOKEN_EXPIRATION_DEV';
const accessTokenExpirationProd = 'ACCESS_TOKEN_EXPIRATION_PROD';
const refreshTokenExpirationDev = 'REFRESH_TOKEN_EXPIRATION_DEV';
const refreshTokenExpirationProd = 'REFRESH_TOKEN_EXPIRATION_PROD';
export const envVariableKeys = {
  env,
  dbType,
  dbHost,
  dbPort,
  dbUsername,
  dbPassword,
  dbDatabase,
  hashRounds,
  accessToken,
  refreshToken,

  accessTokenExpirationDev,
  accessTokenExpirationProd,
  refreshTokenExpirationDev,
  refreshTokenExpirationProd,
};
