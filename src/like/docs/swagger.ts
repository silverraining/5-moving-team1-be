import {
  CODE_200_SUCCESS,
  CODE_404_NOT_FOUND,
  CODE_500_INTERNAL_SERVER_ERROR,
} from '@/common/docs/response.swagger';
import {
  likedMoverListSchema,
  MessageSchema,
} from '@/common/docs/schema.swagger';
import {
  customerProfileNotFoundError,
  moverNotFoundError,
} from '@/common/docs/validation.swagger';
import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

// 찜하기 (create)
export function ApiCreateLike() {
  return applyDecorators(
    ApiOperation({
      summary: '찜하기',
      description: '고객님이 특정 기사님을 찜합니다.',
    }),
    ApiResponse(
      CODE_200_SUCCESS({
        description: '찜하기 성공한 경우',
        schema: MessageSchema('찜하기 성공!'),
      }),
    ),
    ApiResponse(
      CODE_404_NOT_FOUND([moverNotFoundError, customerProfileNotFoundError]),
    ),
    ApiResponse(
      CODE_500_INTERNAL_SERVER_ERROR({
        description: '찜하기 저장 중 서버 오류',
      }),
    ),
  );
}

// 찜한 기사 리스트 조회 (findAll)
export function ApiGetLikedMovers() {
  return applyDecorators(
    ApiOperation({
      summary: '찜한 기사 목록 조회',
      description: '고객님이 찜한 기사님 리스트를 조회합니다.',
    }),
    ApiResponse(
      CODE_200_SUCCESS({
        description: '찜한 기사 리스트 반환',
        schema: likedMoverListSchema,
      }),
    ),
    ApiResponse(CODE_404_NOT_FOUND([customerProfileNotFoundError])),
    ApiResponse(
      CODE_500_INTERNAL_SERVER_ERROR({
        description: '서버 오류',
        message: '찜한 기사 목록 조회 중 오류 발생',
      }),
    ),
  );
}

// 찜하기 취소 (remove)
export function ApiDeleteLike() {
  return applyDecorators(
    ApiOperation({
      summary: '찜하기 취소',
      description: '고객님이 특정 기사님 찜하기를 취소합니다.',
    }),
    ApiResponse(
      CODE_200_SUCCESS({
        description: '찜하기 취소 성공',
        schema: MessageSchema('찜하기 취소 성공!'),
      }),
    ),
    ApiResponse(
      CODE_404_NOT_FOUND([moverNotFoundError, customerProfileNotFoundError]),
    ),
    ApiResponse(
      CODE_500_INTERNAL_SERVER_ERROR({
        description: '찜하기 취소 중 서버 오류',
      }),
    ),
  );
}
