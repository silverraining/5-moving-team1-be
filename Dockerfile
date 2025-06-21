# Node.js 베이스 이미지 사용
FROM node:20-alpine

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

# 컨테이너 외부에서 접근 가능한 포트 설정
EXPOSE 3000

# 서버 실행
CMD ["pnpm", "start:prod"] 