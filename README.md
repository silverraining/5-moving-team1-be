# 📦 무빙 (Moving)

이사 전문가 매칭 서비스 무빙의 백엔드 API 서버입니다. NestJS 프레임워크를 기반으로 개발되었으며, 고객과 이사 기사를 연결하는 플랫폼 서비스를 제공합니다.

## 프로젝트 개요

무빙은 이사 서비스를 필요로 하는 고객과 이사 전문가 기사님을 매칭하는 서비스입니다. 고객은 견적을 요청하고, 기사는 견적을 제안하며, 상호 평가를 통해 신뢰성 있는 이사 서비스를 제공합니다.

## 프로젝트 기간

2025.5.15 ~ 2025.06.27

## 링크

- 배포 URL : https://5-moving.vercel.app/
- API 문서 : http://ec2-15-164-171-112.ap-northeast-2.compute.amazonaws.com/api-docs
- 팀 협업 문서 : https://positive-kingfisher-003.notion.site/1-_-1f0d9fa672ba8055b067ec2833354efd?source=copy_link

## 기술 스택

- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL + TypeORM
- **Authentication**: JWT, Passport (Local, Google, Kakao, Naver)
- **File Storage**: AWS S3
- **Package Manager**: pnpm
- **Testing**: Jest

## 개발 도구

### Code Quality

- **ESLint**: 코드 품질 관리
- **Prettier**: 코드 포맷팅
- **TypeScript**: 타입 안정성

## 프로젝트 구조

```
src/
├── auth/                 # 인증 및 인가
├── user/                # 사용자 공통 기능
├── customer-profile/    # 고객 프로필 관리
├── mover-profile/       # 기사 프로필 관리
├── estimate-request/    # 견적 요청 관리
├── estimate-offer/      # 견적 제안 관리
├── like/               # 찜 기능
├── review/             # 리뷰 시스템
├── notification/       # 알림 시스템
├── s3/                 # 파일 업로드
├── database/           # 데이터베이스 설정
├── scheduler/          # 스케줄러
└── common/             # 공통 유틸리티
```

## 데이터베이스 ERD

## 아키텍쳐

## 팀원별 담당 기능

### 정하윤

**기사님 견적 관리 관련 CRUD 담당**

#### 구현된 API

- `POST /api/s3/presigned-url` - S3 Presigned URL 요청
- `GET /api/estimate-offer/:offers` - 견적 제안 목록 조회
- `GET /api/estimate-offer/:offerId` - 견적 제안 상세 조회
- `GET /api/estimate-offer/rejected-offers` - 반려한 견적 목록 조회
- `POST /api/estimate-offer/:requestId` - 견적 보내기
- `PATCH /api/estimate-offer/:requestId/rejected` - 견적 반려하기

### 최은비

#### 구현된 API

### 민지영

#### 구현된 API

### 김조순

#### 구현된 API

## 주요 기능

### 인증 시스템

- JWT 기반 인증
- 소셜 로그인 (Google, Kakao, Naver)
- 역할 기반 접근 제어 (고객/기사)

### 견적 시스템

- 고객의 견적 요청
- 기사의 견적 제안
- 견적 상태 관리 (대기/확정/거절)

### 프로필 관리

- 고객/기사 프로필 등록 및 수정
- 기사 검색 및 필터링
- 프로필 이미지 업로드

### 평가 시스템

- 서비스 완료 후 상호 리뷰
- 별점 및 텍스트 리뷰
- 기사 평점 관리

### 부가 기능

- 기사 찜하기
- 실시간 알림
- 파일 업로드 (AWS S3)
