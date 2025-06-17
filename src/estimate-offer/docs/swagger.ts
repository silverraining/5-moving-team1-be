import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import {
  CODE_400_BAD_REQUEST,
  CODE_401_RESPONSES,
} from '@/common/docs/response.swagger';
import { EstimateOfferResponseDto } from '../dto/estimate-offer-response.dto';
import { CreateEstimateOfferDto } from '../dto/create-estimate-offer.dto';
import { UpdateEstimateOfferDto } from '../dto/update-estimate-offer.dto';
import { GetEstimateOffersResponseDto } from '../dto/estimate-offer-response.dto';

export function ApiGetPendingEstimateOffers() {
  return applyDecorators(
    ApiOperation({
      summary: '대기 중인 견적 요청에 대한 오퍼 목록 조회',
      description:
        '로그인한 고객 본인의 견적 요청중 현재 상태가 PENDING인 견적 요청 ID에 대해 기사님들이 보낸 견적 목록을 조회합니다.',
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'requestId',
      required: true,
      description: '견적 요청 ID (UUID)',
      example: '9ed4f4a0-0391-4a4f-af22-039aed8ccc9b',
      type: String,
    }),
    ApiResponse({
      status: 200,
      description: '대기 중인 견적 목록 조회 성공',
      type: EstimateOfferResponseDto,
      isArray: true,
    }),
    ApiResponse({
      status: 400,
      description: '잘못된 요청',
    }),
    ApiResponse({
      status: 403,
      description: '권한 없음. 본인의 요청이 아닐 경우',
    }),
  );
}

export function ApiGetEstimateOfferDetail() {
  return applyDecorators(
    ApiOperation({
      summary: '견적 상세 조회',
      description: '특정 견적 요청에 대한 기사별 견적서를 상세 조회합니다.',
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'requestId',
      description: '견적 요청 ID (UUID)',
      example: '9ed4f4a0-0391-4a4f-af22-039aed8ccc9b',
      type: String,
    }),
    ApiParam({
      name: 'moverId',
      description: '기사 ID (UUID)',
      example: '9ec9e7ba-d922-48b4-a821-17842bc02944',
      type: String,
    }),
    ApiResponse({
      status: 200,
      description: '견적 상세 조회 성공',
      type: EstimateOfferResponseDto,
    }),
    ApiResponse(CODE_400_BAD_REQUEST([])),
    ApiResponse(CODE_401_RESPONSES),
    ApiResponse({
      status: 403,
      description: '권한 없음. 본인의 요청이 아닐 경우',
    }),
  );
}

export function ApiCreateEstimateOffer() {
  return applyDecorators(
    ApiOperation({
      summary: '견적 제안 생성',
      description:
        '기사가 고객의 견적 요청에 대해 견적을 제안합니다. 한 기사는 동일한 견적 요청에 대해 한 번만 제안할 수 있습니다.',
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'requestId',
      required: true,
      description: '견적 요청 ID (UUID)',
      example: '9ed4f4a0-0391-4a4f-af22-039aed8ccc9b',
      type: String,
    }),
    ApiBody({
      type: CreateEstimateOfferDto,
      description: '견적 제안 정보',
    }),
    ApiResponse({
      status: 201,
      description: '견적 제안 생성 성공',
      schema: {
        type: 'object',
        properties: {
          statusCode: {
            type: 'number',
            example: 201,
          },
          message: {
            type: 'string',
            example: '견적 제안이 성공적으로 생성되었습니다.',
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: '잘못된 요청 (중복 제안, 존재하지 않는 요청 등)',
    }),
    ApiResponse({
      status: 403,
      description: '권한 없음',
    }),
    ApiResponse(CODE_401_RESPONSES),
  );
}

export function ApiRejectEstimateOffer() {
  return applyDecorators(
    ApiOperation({
      summary: '견적 요청 반려',
      description: '기사가 자신에게 지정된 견적 요청을 반려합니다.',
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'requestId',
      required: true,
      description: '견적 요청 ID (UUID)',
      example: '9ed4f4a0-0391-4a4f-af22-039aed8ccc9b',
      type: String,
    }),
    ApiBody({
      type: UpdateEstimateOfferDto,
      description: '견적 요청 반려 정보',
    }),
    ApiResponse({
      status: 200,
      description: '견적 요청 반려 성공',
      type: UpdateEstimateOfferDto,
    }),
    ApiResponse({
      status: 400,
      description:
        '잘못된 요청 (이미 처리된 요청이거나 기사 프로필을 찾을 수 없는 경우 또는 권한 없음)',
    }),
    ApiResponse({
      status: 403,
      description: '권한 없음 (지정된 기사가 아닌 경우 또는 권한 없음)',
    }),
    ApiResponse({
      status: 404,
      description: '견적 요청을 찾을 수 없음 또는 권한 없음',
    }),
    ApiResponse(CODE_401_RESPONSES),
  );
}

export function ApiGetMoverEstimateOffers() {
  return applyDecorators(
    ApiOperation({
      summary: '기사가 보낸 견적 목록 조회',
      description:
        '로그인한 기사가 여러 고객의 요청에 대해 보낸 견적의 목록을 조회합니다.',
    }),
    ApiBearerAuth(),
    ApiResponse({
      status: 200,
      description: '견적 목록 조회 성공',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            isConfirmed: {
              type: 'boolean',
              description: '견적이 확정되었는지 여부',
              example: false,
            },
            moveType: {
              type: 'string',
              description: '이사 유형',
              example: 'SMALL',
            },
            moveDate: {
              type: 'string',
              format: 'date-time',
              description: '이사 예정일',
              example: '2024-01-15T00:00:00.000Z',
            },
            isTargeted: {
              type: 'boolean',
              description: '지명 견적 여부 (고객이 기사를 직접 지정했는지)',
              example: false,
            },
            customerName: {
              type: 'string',
              description: '고객 이름',
              example: '김고객',
            },
            fromAddressMinimal: {
              type: 'object',
              description: '출발지 간단 주소 (시도, 시군구)',
              properties: {
                sido: {
                  type: 'string',
                  example: '서울특별시',
                },
                sigungu: {
                  type: 'string',
                  example: '강남구',
                },
              },
            },
            toAddressMinimal: {
              type: 'object',
              description: '도착지 간단 주소 (시도, 시군구)',
              properties: {
                sido: {
                  type: 'string',
                  example: '서울특별시',
                },
                sigungu: {
                  type: 'string',
                  example: '서초구',
                },
              },
            },
            price: {
              type: 'number',
              description: '견적 가격 (원)',
              example: 120000,
            },
            estimateRequestId: {
              type: 'string',
              description: '견적 요청 ID',
              example: '9ed4f4a0-0391-4a4f-af22-039aed8ccc9b',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: '견적 제안 생성일시',
              example: '2024-01-10T10:30:00.000Z',
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: '잘못된 요청 (기사 프로필을 찾을 수 없는 경우)',
    }),
    ApiResponse(CODE_401_RESPONSES),
    ApiResponse({
      status: 403,
      description: '권한 없음 (기사가 아닌 경우)',
    }),
  );
}

export function ApiGetRejectedEstimateOffers() {
  return applyDecorators(
    ApiOperation({
      summary: '기사가 반려한 견적 목록 조회',
      description: '기사가 고객의 요청에 대해 반려한 견적의 목록을 조회합니다.',
    }),

    ApiBearerAuth(),
    ApiResponse({
      status: 200,
      description: '반려된 견적 목록 조회 성공',
      type: GetEstimateOffersResponseDto,
      isArray: true,
      schema: {
        example: [
          {
            isConfirmed: false,
            moveType: 'HOME',
            moveDate: '2024-03-20',
            isTargeted: true,
            customerName: '홍길동',
            fromAddressMinimal: {
              sido: '서울특별시',
              sigungu: '강남구',
            },
            toAddressMinimal: {
              sido: '경기도',
              sigungu: '성남시',
            },
            estimateRequestId: 'uuid-string',
            createdAt: '2024-03-15T09:00:00.000Z',
          },
        ],
      },
    }),
    ApiUnauthorizedResponse({
      description: '인증되지 않은 사용자',
    }),
    ApiForbiddenResponse({
      description: '기사 권한이 없는 사용자',
    }),
    ApiBadRequestResponse({
      description: '기사 프로필을 찾을 수 없는 경우',
      schema: {
        example: {
          message: '기사 프로필을 찾을 수 없습니다.',
          statusCode: 400,
          error: 'Bad Request',
        },
      },
    }),
  );
}
import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import {
  CODE_200_SUCCESS,
  CODE_400_BAD_REQUEST,
  CODE_401_RESPONSES,
  CODE_403_FORBIDDEN,
  CODE_404_NOT_FOUND,
  CODE_500_INTERNAL_SERVER_ERROR,
} from '@/common/docs/response.swagger';
import { EstimateOfferResponseDto } from '../dto/estimate-offer-response.dto';
import { CreateEstimateOfferDto } from '../dto/create-estimate-offer.dto';
import { UpdateEstimateOfferDto } from '../dto/update-estimate-offer.dto';
import { MessageSchema } from '@/common/docs/schema.swagger';
import {
  estimateOfferAlreadyProcessedError,
  estimateOfferNotFoundError,
  estimateRequestAlreadyProcessedError,
  estimateRequestNotFoundError,
  ForbiddenError,
} from '@/common/docs/validation.swagger';
import { GenericPaginatedDto } from '@/common/dto/paginated-response.dto';

export function ApiGetPendingEstimateOffers() {
  return applyDecorators(
    ApiOperation({
      summary: '대기 중인 견적 요청에 대한 오퍼 목록 조회',
      description:
        '로그인한 고객 본인의 견적 요청 중 상태가 PENDING인 요청에 대해 기사님들이 보낸 오퍼 목록을 커서 기반 페이지네이션 형식으로 조회합니다.',
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'requestId',
      required: true,
      description: '견적 요청 ID (UUID)',
      example: '9ed4f4a0-0391-4a4f-af22-039aed8ccc9b',
    }),
    ApiQuery({
      name: 'cursor',
      required: false,
      type: String,
      description:
        '이전 응답의 nextCursor 값을 그대로 사용하세요. 이 값이 없으면 가장 최근 오퍼부터 조회합니다.',
    }),
    ApiQuery({
      name: 'take',
      required: false,
      type: Number,
      example: 5,
      description: '가져올 개수 (기본값: 5)',
    }),
    ApiExtraModels(GenericPaginatedDto, EstimateOfferResponseDto),
    ApiResponse({
      status: 200,
      description: '대기 중인 견적 목록 조회 성공',
      schema: {
        allOf: [
          { $ref: getSchemaPath(GenericPaginatedDto) },
          {
            properties: {
              items: {
                type: 'array',
                items: {
                  allOf: [
                    { $ref: getSchemaPath(EstimateOfferResponseDto) },
                    {
                      properties: {
                        mover: {
                          type: 'object',
                          properties: {
                            nickname: { type: 'string', example: '김기사' },
                            imageUrl: {
                              type: 'string',
                              example: 'https://example.com/profile.jpg',
                              nullable: true,
                            },
                            experience: { type: 'number', example: 3 },
                            intro: {
                              type: 'string',
                              example: '친절한 기사입니다.',
                            },
                            rating: { type: 'number', example: 4.7 },
                            reviewCount: { type: 'number', example: 12 },
                            likeCount: { type: 'number', example: 23 },
                            isLiked: { type: 'boolean', example: true },
                            confirmedCount: { type: 'number', example: 5 },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        ],
      },
    }),
    ApiResponse({ status: 400, description: '잘못된 요청' }),
    ApiResponse({
      status: 403,
      description: '권한 없음. 본인의 요청이 아닐 경우',
    }),
  );
}

export function ApiGetEstimateOfferDetail() {
  return applyDecorators(
    ApiOperation({
      summary: '견적 상세 조회',
      description: '특정 견적 요청에 대한 기사별 견적서를 상세 조회합니다.',
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'requestId',
      description: '견적 요청 ID (UUID)',
      example: '9ed4f4a0-0391-4a4f-af22-039aed8ccc9b',
      type: String,
    }),
    ApiParam({
      name: 'moverProfileId',
      description: '기사 ID (UUID)',
      example: '9ec9e7ba-d922-48b4-a821-17842bc02944',
      type: String,
    }),
    ApiResponse({
      status: 200,
      description: '견적 상세 조회 성공',
      type: EstimateOfferResponseDto,
    }),
    ApiResponse(CODE_400_BAD_REQUEST([])),
    ApiResponse(CODE_401_RESPONSES),
    ApiResponse({
      status: 403,
      description: '권한 없음. 본인의 요청이 아닐 경우',
    }),
  );
}

export function ApiCreateEstimateOffer() {
  return applyDecorators(
    ApiOperation({
      summary: '견적 제안 생성',
      description:
        '기사가 고객의 견적 요청에 대해 견적을 제안합니다. 한 기사는 동일한 견적 요청에 대해 한 번만 제안할 수 있습니다.',
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'requestId',
      required: true,
      description: '견적 요청 ID (UUID)',
      example: '9ed4f4a0-0391-4a4f-af22-039aed8ccc9b',
      type: String,
    }),
    ApiBody({
      type: CreateEstimateOfferDto,
      description: '견적 제안 정보',
    }),
    ApiResponse({
      status: 201,
      description: '견적 제안 생성 성공',
      schema: {
        type: 'object',
        properties: {
          statusCode: {
            type: 'number',
            example: 201,
          },
          message: {
            type: 'string',
            example: '견적 제안이 성공적으로 생성되었습니다.',
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: '잘못된 요청 (중복 제안, 존재하지 않는 요청 등)',
    }),
    ApiResponse({
      status: 403,
      description: '권한 없음',
    }),
    ApiResponse(CODE_401_RESPONSES),
  );
}

export function ApiRejectEstimateOffer() {
  return applyDecorators(
    ApiOperation({
      summary: '견적 요청 반려',
      description: '기사가 자신에게 지정된 견적 요청을 반려합니다.',
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'requestId',
      required: true,
      description: '견적 요청 ID (UUID)',
      example: '9ed4f4a0-0391-4a4f-af22-039aed8ccc9b',
      type: String,
    }),
    ApiBody({
      type: UpdateEstimateOfferDto,
      description: '견적 요청 반려 정보',
    }),
    ApiResponse({
      status: 200,
      description: '견적 요청 반려 성공',
      type: UpdateEstimateOfferDto,
    }),
    ApiResponse({
      status: 400,
      description:
        '잘못된 요청 (이미 처리된 요청이거나 기사 프로필을 찾을 수 없는 경우 또는 권한 없음)',
    }),
    ApiResponse({
      status: 403,
      description: '권한 없음 (지정된 기사가 아닌 경우 또는 권한 없음)',
    }),
    ApiResponse({
      status: 404,
      description: '견적 요청을 찾을 수 없음 또는 권한 없음',
    }),
    ApiResponse(CODE_401_RESPONSES),
  );
}

export function ApiConfirmEstimateOffer() {
  return applyDecorators(
    ApiOperation({
      summary: '견적 요청 확정',
      description: '고객이 기사에게 받은 견적을 확정합니다.',
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'requestId',
      required: true,
      description: '견적 요청 ID (UUID)',
      example: '9ed4f4a0-0391-4a4f-af22-039aed8ccc9b',
      type: String,
    }),
    ApiParam({
      name: 'moverProfileId',
      required: true,
      description: '기사 ID (UUID)',
      example: '1a2b3c4d-5678-90ef-abcd-1234567890ab',
      type: String,
    }),
    ApiResponse(
      CODE_200_SUCCESS({
        description: '견적 요청 확정 성공한 경우',
        schema: MessageSchema('견적 제안이 성공적으로 확정되었습니다.'),
      }),
    ),
    ApiResponse(
      CODE_400_BAD_REQUEST([
        estimateRequestAlreadyProcessedError,
        estimateOfferAlreadyProcessedError,
      ]),
    ),
    ApiResponse(CODE_403_FORBIDDEN([ForbiddenError])),
    ApiResponse(CODE_401_RESPONSES),
    ApiResponse(
      CODE_404_NOT_FOUND([
        estimateRequestNotFoundError,
        estimateOfferNotFoundError,
      ]),
    ),
    ApiResponse(
      CODE_500_INTERNAL_SERVER_ERROR({
        description: '견적 요청 확정 실패한 경우',
        message: '견적 확정 처리 중 서버 오류가 발생했습니다.',
      }),
    ),
  );
}
