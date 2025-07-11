# Node.js 베이스 이미지 사용
FROM node:20-bullseye

# 빌드 인수 설정
ARG BUILD_TIME
ARG COMMIT_HASH

# 작업 디렉토리 설정
WORKDIR /app

# package.json과 pnpm-lock.yaml 복사
COPY package.json pnpm-lock.yaml ./

# pnpm 설치
RUN npm install -g pnpm

# 의존성 설치
RUN pnpm install

# 소스 코드 복사
COPY . .

# 프로덕션용 빌드
RUN pnpm build

# 환경변수 설정 (빌드 정보)
ENV BUILD_TIME=${BUILD_TIME}
ENV COMMIT_HASH=${COMMIT_HASH}

# 컨테이너 외부에서 접근 가능한 포트 설정
EXPOSE 3000

# 서버 실행
CMD ["pnpm", "start:prod"] 