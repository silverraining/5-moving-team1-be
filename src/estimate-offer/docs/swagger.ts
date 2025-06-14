import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import {
  CODE_400_BAD_REQUEST,
  CODE_401_RESPONSES,
} from '@/common/docs/response.swagger';
import { EstimateOfferResponseDto } from '../dto/estimate-offer-response.dto';
import { CreateEstimateOfferDto } from '../dto/create-estimate-offer.dto';
import { UpdateEstimateOfferDto } from '../dto/update-estimate-offer.dto';

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
