import {
  defaultServiceRegionMap,
  defaultServiceTypeMap,
} from '@/mover-profile/dto/get-mover-profiles.dto';

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

export const MoverProfileSchema = {
  example: {
    id: 'c9844fd7-d5f5-455c-8e11-f73ac3cfb9df',
    nickname: '무빙이',
    imageUrl: 'https://example.com/image.jpg',
    experience: 5,
    intro: '친절한 이사 전문가입니다.',
    description: '고객님의 이사를 정성껏 도와드립니다.',
    serviceType: defaultServiceTypeMap,
    serviceRegion: defaultServiceRegionMap,
    createdAt: '2025-05-29T12:00:00.000Z',
  },
};

export const MoverProfileListSchema = {
  example: {
    movers: [
      {
        id: 'c9844fd7-d5f5-455c-8e11-f73ac3cfb9df',
        nickname: '무빙이',
        imageUrl: 'https://example.com/image.jpg',
        experience: 5,
        intro: '친절한 이사 전문가입니다.',
        description: '고객님의 이사를 정성껏 도와드립니다.',
        serviceType: defaultServiceTypeMap,
        serviceRegion: defaultServiceRegionMap,
      },
    ],
    count: 1,
    nextCursor:
      'eyJ2YWx1ZXMiOnsiaWQiOiJjOTg0NGZkNy1kNWY1LTQ1NWMtOGUxMS1mNzNhYzNjZmI5ZGYifSwib3JkZXIiOnsiZmllbGQiOiJjb25maXJtZWRfZXN0aW1hdGVfY291bnQiLCJkaXJlY3Rpb24iOiJERVNDIn19',
  },
};

export const MessageSchema = (message: string) => ({
  example: {
    message: message || '요청이 성공적으로 처리되었습니다.',
  },
});
