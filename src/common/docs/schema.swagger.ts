/**
 * 200번대 응답 메시지 스키마에 사용
 * 요청이 성공적으로 처리되었음을 나타내는 메시지
 * 
 * CODE_201_CREATED, CODE_200_SUCCESS 등의 함수에서 사용
 * 파라미터의 schema 속성에 사용
 * 
 * 예시:
 *  ApiResponse(
       CODE_201_CREATED({
         description: '[mover] 프로필 생성 성공',
         schema: MoverProfileSchema,
       }),
     ),
 */

import {
  defaultServiceRegion,
  defaultServiceType,
} from '../const/service.const';

export const MoverProfileSchema = {
  example: {
    id: 'c9844fd7-d5f5-455c-8e11-f73ac3cfb9df',
    nickname: '무빙이',
    imageUrl: 'https://example.com/image.jpg',
    experience: 5,
    intro: '친절한 이사 전문가입니다.',
    description: '고객님의 이사를 정성껏 도와드립니다.',
    serviceType: defaultServiceType,
    serviceRegion: defaultServiceRegion,
    createdAt: '2025-05-29T12:00:00.000Z',
  },
};

export const MoverProfileListSchema = {
  example: {
    movers: [
      {
        id: 'f888f633-2c37-4e39-a898-a4a288d39355',
        nickname: '기사님6',
        imageUrl: 'https://example.com/image.jpg',
        experience: 5,
        intro: '친절한 이사 전문가입니다.',
        serviceType: {
          SMALL: true,
          HOME: true,
          OFFICE: true,
        },
        review_count: 0,
        average_rating: 0,
        confirmed_estimate_count: 1,
        like_count: 1,
        isTargeted: false,
      },
    ],
    hasNext: true,
    nextCursor:
      'eyJ2YWx1ZXMiOnsiaWQiOiJjOTg0NGZkNy1kNWY1LTQ1NWMtOGUxMS1mNzNhYzNjZmI5ZGYifSwib3JkZXIiOnsiZmllbGQiOiJjb25maXJtZWRfZXN0aW1hdGVfY291bnQiLCJkaXJlY3Rpb24iOiJERVNDIn19',
  },
};

export const MoverProfileDetailSchema = {
  example: {
    id: '8a12f8b9-1e4b-49f2-8302-4c5c8cbcb488',
    nickname: '최강이사',
    experience: 5,
    averageRating: 4.8,
    reviewCount: 10,
    confirmedEstimateCount: 15,
    like_count: 21,
    reviews: [
      {
        rating: 5,
        comment: '정말 친절하셨어요!',
        createdAt: '2025-05-01T12:34:56.000Z',
        customer: {
          user: {
            email: 'customer@example.com',
          },
        },
      },
    ],
  },
};

export const CustomerProfileSchema = {
  example: {
    id: 'a1234567-b89c-1234-d567-890123456789',
    imageUrl: 'https://example.com/customer.jpg',
    serviceType: defaultServiceType,
    serviceRegion: defaultServiceRegion,
  },
};

export const CustomerProfileDetailSchema = {
  example: {
    name: '홍길동',
    email: 'hong@example.com',
    phone: '010-1234-5678',
    id: 'a1234567-b89c-1234-d567-890123456789',
    imageUrl: 'https://example.com/customer.jpg',
    serviceType: defaultServiceType,
    serviceRegion: defaultServiceRegion,
  },
};

export const userDataSchema = {
  example: {
    refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ...',
    accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ...',
    user: {
      name: '홍길동',
      email: 'hong@example.com',
      phone: '01012345678',
      role: 'CUSTOMER',
      imageUrl: 'https://example.com/image.jpg',
      provider: 'LOCAL',
    },
  },
};

export const likedMoverListSchema = {
  example: [
    {
      id: 'uuid-1234-abcd',
      nickname: '홍길동',
      imageUrl: 'https://example.com/image.jpg',
      experience: 5,
      serviceType: '배송',
      reviewCount: 120,
      averageRating: 4.7,
      confirmedEstimateCount: 75,
      likeCount: 300,
    },
    {
      id: 'uuid-5678-efgh',
      nickname: '김철수',
      imageUrl: 'https://example.com/image2.jpg',
      experience: 3,
      serviceType: '이사',
      reviewCount: 60,
      averageRating: 4.3,
      confirmedEstimateCount: 30,
      likeCount: 150,
    },
  ],
};

export const MessageSchema = (message: string) => ({
  example: {
    message: message || '요청이 성공적으로 처리되었습니다.',
  },
});
