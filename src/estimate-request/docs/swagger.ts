import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
  ApiParam,
  ApiExtraModels,
  ApiOkResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';
import { CreateEstimateRequestDto } from '@/estimate-request/dto/create-estimate-request.dto';
import { EstimateRequestResponseDto } from '@/estimate-request/dto/estimate-request-response.dto';
import {
  CODE_400_BAD_REQUEST,
  CODE_401_RESPONSES,
} from '@/common/docs/response.swagger';
import { CreateEstimateRequestResponseDto } from '../dto/create-estimate-request.response.dto';
import { GenericPaginatedDto } from '@/common/dto/paginated-response.dto';
import { OrderField } from '@/common/validator/order.validator';

export function ApiCreateEstimateRequest() {
  return applyDecorators(
    ApiOperation({
      summary: '견적 요청 생성',
      description: '고객이 새로운 견적 요청을 생성합니다.',
    }),
    ApiBearerAuth(),
    ApiBody({
      type: CreateEstimateRequestDto,
      examples: {
        basic: {
          summary: '기본 예시',
          value: {
            moveType: 'HOME',
            moveDate: '2025-07-15',
            fromAddress: {
              sido: '경기',
              sidoEnglish: 'Gyeonggi',
              sigungu: '성남시 분당구',
              roadAddress: '불정로 6',
              fullAddress: '경기 성남시 분당구 불정로 6',
            },
            toAddress: {
              sido: '서울',
              sidoEnglish: 'Seoul',
              sigungu: '강남구',
              roadAddress: '테헤란로 212',
              fullAddress: '서울 강남구 테헤란로 212',
            },
            targetMoverIds: ['a1b2c3d4-e5f6-7890-1234-56789abcdeff'],
          },
        },
      },
    }),
    ApiResponse({
      status: 201,
      description: '견적 요청 생성 성공',
      type: CreateEstimateRequestResponseDto,
    }),
    ApiResponse(
      CODE_400_BAD_REQUEST([
        {
          key: 'ActiveEstimateExists',
          summary: '진행 중인 요청 중복',
          value: {
            statusCode: 400,
            message: '진행 중인 견적 요청이 이미 존재합니다.',
            error: 'Bad Request',
          },
        },
      ]),
    ),
    ApiResponse(CODE_401_RESPONSES),
  );
}

export function ApiGetMyEstimateHistory() {
  return applyDecorators(
    ApiOperation({
      summary: '받았던 견적 목록 조회',
      description:
        '고객이 생성한 견적 요청 중 완료(COMPLETED), 취소(CANCELED), 만료(EXPIRED)된 요청 목록에 대해 받았던 견적서 목록을 커서 기반 페이지네이션 방식으로 조회합니다.\n정렬 기준은 생성일 최신 순(`createdAt DESC`)으로 고정되어 있습니다.',
    }),
    ApiBearerAuth(),

    ApiQuery({
      name: 'cursor',
      required: false,
      description:
        '커서 기준 값. 응답의 `nextCursor` 값을 복사해 다음 요청에 사용하세요.',
      example: '2025-06-15T12:00:00.000Z',
    }),
    ApiQuery({
      name: 'take',
      required: false,
      description: '가져올 데이터 수 (기본값: 5)',
      example: 5,
    }),

    ApiExtraModels(GenericPaginatedDto, EstimateRequestResponseDto),
    ApiOkResponse({
      description: '견적 요청 목록 조회 성공',
      schema: {
        allOf: [
          {
            $ref: getSchemaPath(GenericPaginatedDto),
          },
          {
            properties: {
              items: {
                type: 'array',
                items: { $ref: getSchemaPath(EstimateRequestResponseDto) },
              },
            },
          },
        ],
      },
    }),
    ApiResponse({ status: 401, description: '인증되지 않은 사용자' }),
    ApiResponse({ status: 403, description: '고객 권한이 없는 사용자' }),
  );
}

export function ApiGetMyActiveEstimateRequest() {
  return applyDecorators(
    ApiOperation({
      summary: '진행 중인 견적 요청 ID 조회 (개발용)',
      description: 'PENDING, CONFIRMED 상태의 견적 요청 ID만 반환합니다.',
    }),
    ApiResponse({
      status: 200,
      description: '진행 중인 estimateRequestId 리스트',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            estimateRequestId: { type: 'string', example: 'uuid-example' },
          },
        },
      },
    }),
  );
}
export function ApiAddTargetMover() {
  return applyDecorators(
    ApiOperation({
      summary: '지정 기사 추가',
      description:
        '특정 견적 요청 ID(requestId)에 지정 기사를 추가합니다. 최대 3명까지 추가할 수 있습니다.',
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'requestId',
      required: true,
      description: '지정 기사를 추가할 견적 요청 ID',
      example: '52145515-6fd9-4ecd-9fd8-7106fbce9765',
    }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          moverProfileId: {
            type: 'string',
            format: 'uuid',
            example: '9ec9e7ba-d922-48b4-a821-17842bc02944',
            description: '추가할 기사님 ID (moverProfileId)',
          },
        },
        required: ['moverProfileId'],
      },
    }),
    ApiResponse({
      status: 200,
      description: '지정 기사 추가 성공',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: '🧑‍🔧 김기사님이 지정 견적 기사로 추가되었습니다.',
          },
        },
      },
    }),
    ApiResponse(
      CODE_400_BAD_REQUEST([
        {
          key: 'AlreadyTargetedMover',
          summary: '이미 지정된 기사',
          value: {
            statusCode: 400,
            message: '이미 지정 기사로 추가된 기사님입니다.',
            error: 'Bad Request',
          },
        },
        {
          key: 'MaxTargetMoversReached',
          summary: '지정 기사 수 초과',
          value: {
            statusCode: 400,
            message: '지정 기사는 최대 3명까지 추가할 수 있습니다.',
            error: 'Bad Request',
          },
        },
      ]),
    ),
    ApiResponse(CODE_401_RESPONSES),
  );
}

export function ApiGetRequestListForMover() {
  return applyDecorators(
    ApiOperation({
      summary: '기사가 진행 중인 견적 요청 목록 조회',
      description:
        '견적 요청 상태가 PENDING인 요청들 중, targetMoverIds에 본인의 ID가 포함된 경우 `isTargeted: true`로 반환됩니다.\n\n커서 기반 페이지네이션과 정렬 필드를 쿼리로 지정할 수 있습니다.',
    }),
    ApiBearerAuth(),

    ApiQuery({
      name: 'orderField',
      enum: [OrderField.MOVE_DATE, OrderField.CREATED_AT],
      required: false,
      description: '정렬 기준 필드 (예: 이사일 빠른 순 || 요청일 빠른 순)',
    }),
    ApiQuery({
      name: 'cursor',
      required: false,
      description:
        '이후 응답에서 받은 `nextCursor` 값을 사용해 다음 페이지를 조회하세요.',
    }),
    ApiQuery({
      name: 'take',
      required: false,
      description: '가져올 데이터 수 (기본값: 5)',
      example: 5,
    }),

    ApiExtraModels(GenericPaginatedDto, EstimateRequestResponseDto),
    ApiOkResponse({
      description: '견적 요청 목록 조회 성공',
      schema: {
        allOf: [
          { $ref: getSchemaPath(GenericPaginatedDto) },
          {
            properties: {
              items: {
                type: 'array',
                items: { $ref: getSchemaPath(EstimateRequestResponseDto) },
              },
            },
          },
        ],
      },
    }),

    ApiResponse({ status: 401, description: '인증되지 않은 사용자' }),
    ApiResponse({ status: 403, description: '기사 권한이 없는 사용자' }),
  );
}
