import {
  defaultServiceRegionMap,
  defaultServiceTypeMap,
} from '@/mover-profile/dto/get-mover-profiles.dto';

/**
 * ApiBody에서 사용되는 예시 데이터
 * 
 * 예시:
 *  ApiBody({
       description:
         '수정할 필드 (별명, 프로필 이미지 URL, 경력, 한 줄 소개, 상세 설명, 서비스 유형, 서비스 지역)를 포함합니다.',
       type: UpdateMoverProfileDto,
       examples: {
         fullExample: UpdateMoverProfileFullExample,
       },
     }),
 */

// [mover] 프로필 fullExample
export const CreateMoverProfileFullExample = {
  summary: '[mover] 프로필 등록 예시',
  value: {
    nickname: '무빙이',
    imageUrl: 'https://example.com/image.jpg',
    experience: 5,
    intro: '친절한 이사 전문가입니다.',
    description: '고객님의 이사를 정성껏 도와드립니다.',
    serviceType: defaultServiceTypeMap,
    serviceRegion: defaultServiceRegionMap,
  },
};

export const UpdateMoverProfileFullExample = {
  summary: '[mover] 프로필 수정 예시',
  value: {
    nickname: '새무빙이',
    imageUrl: 'https://example.com/image.jpg',
    experience: 10,
    intro: '알잘딱 이사 전문가입니다.',
    description: '고객님의 이사를 정성껏 도와드립니다.',
    serviceType: defaultServiceTypeMap,
    serviceRegion: defaultServiceRegionMap,
  },
};

export const CreateCustomerProfileFullExample = {
  summary: '[customer] 프로필 등록 예시',
  value: {
    imageUrl: 'https://example.com/image.jpg',
    serviceType: defaultServiceTypeMap,
    serviceRegion: defaultServiceRegionMap,
  },
};

export const UpdateCustomerProfileFullExample = {
  summary: '[customer] 프로필 수정 예시',
  value: {
    name: '새로운 이름',
    phone: '010-1234-5678',
    password: 'passwordTest1234!',
    newPassword: 'passwordTest4321!',
    imageUrl: 'https://example.com/image.jpg',
    serviceType: defaultServiceTypeMap,
    serviceRegion: defaultServiceRegionMap,
  },
};

export const GetMoverProfilesFullExample = {
  summary: '[mover] 프로필 목록 조회 예시 (필터, 정렬 사용, 커서 있음)',
  value: {
    cursor:
      'eyJ2YWx1ZXMiOnsiaWQiOiI0YWRjNmRiOC1hNWJiLTQ5ZjEtOWVmOC1kN2NhYmVjNTAwMWQifSwib3JkZXIiOnsiZmllbGQiOiJjb25maXJtZWRfZXN0aW1hdGVfY291bnQiLCJkaXJlY3Rpb24iOiJERVNDIn19',
    take: 5,
    order: {
      field: 'review_count',
      direction: 'DESC',
    },
    serviceType: defaultServiceTypeMap,
    serviceRegion: defaultServiceRegionMap,
  },
};

export const GetMoverProfileDefaultExample = {
  summary: '[mover] 프로필 목록 처음 조회 예시 (필터, 정렬 사용, 커서 없음)',
  value: {
    take: 5,
    order: {
      field: 'review_count',
      direction: 'DESC',
    },
    serviceType: defaultServiceTypeMap,
    serviceRegion: defaultServiceRegionMap,
  },
};

export const GetMoverProfilesNoFilterExample = {
  summary: '[mover] 프로필 목록 조회 예시 (필터 없음)',
  value: {
    take: 5,
    order: {
      field: 'review_count',
      direction: 'DESC',
    },
  },
};

export const GetMoverProfilesNoFilterWithCursorExample = {
  summary: '[mover] 프로필 목록 조회 예시 (필터 없음, 커서 사용)',
  value: {
    cursor:
      'eyJ2YWx1ZXMiOnsiaWQiOiI0YWRjNmRiOC1hNWJiLTQ5ZjEtOWVmOC1kN2NhYmVjNTAwMWQifSwib3JkZXIiOnsiZmllbGQiOiJjb25maXJtZWRfZXN0aW1hdGVfY291bnQiLCJkaXJlY3Rpb24iOiJERVNDIn19',
    take: 5,
    order: {
      field: 'review_count',
      direction: 'DESC',
    },
  },
};
