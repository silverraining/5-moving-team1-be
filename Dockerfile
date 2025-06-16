# 빌드 스테이지
FROM node:20-alpine AS builder

WORKDIR /app

# pnpm 설치
RUN npm install -g pnpm

# 의존성 파일 복사 및 설치
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# 소스 코드 복사 및 빌드
COPY . .
RUN pnpm build

# 프로덕션 스테이지
FROM node:20-alpine AS production

WORKDIR /app

# pnpm 설치
RUN npm install -g pnpm

# 의존성 파일 복사 및 프로덕션 의존성만 설치
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

# 빌드된 애플리케이션 복사
COPY --from=builder /app/dist ./dist

# 8080 포트 노출 (EB Docker 플랫폼 기본값)
EXPOSE 8080

# 환경변수 설정
ENV PORT=8080

# 애플리케이션 실행
CMD ["node", "dist/main"] 