import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { EstimateOfferResponseDto } from '@/estimate-offer/dto/estimate-offer-response.dto';
import {
  CODE_400_BAD_REQUEST,
  CODE_401_RESPONSES,
} from '@/common/docs/response.swagger';

export function ApiGetEstimateOffers() {
  return applyDecorators(
    ApiOperation({
      summary: '견적 요청에 대한 오퍼 목록 조회',
      description:
        '특정 견적 요청 ID에 해당하는 모든 이사 견적 목록을 조회합니다. 로그인한 고객 본인의 요청에 한해서만 조회 가능합니다.',
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'requestId',
      required: true,
      description: '견적 요청 ID (UUID)',
      example: '1c340ecf-e7f8-4431-bad2-dc19ea9ff3e7',
      type: String,
    }),
    ApiResponse({
      status: 200,
      description: '견적 목록 조회 성공',
      type: EstimateOfferResponseDto,
      isArray: true,
    }),
    ApiResponse(CODE_400_BAD_REQUEST([])),
    ApiResponse({
      status: 403,
      description: '권한 없음. 본인의 요청이 아닐 경우',
    }),
  );
}

export function ApiGetEstimateOfferDetail() {
  return applyDecorators(
    ApiOperation({
      summary: '견적 제안 상세 조회',
      description: '특정 견적 요청에 대한 기사별 견적서를 상세 조회합니다.',
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'requestId',
      description: '견적 요청 ID (UUID)',
      example: '1c340ecf-e7f8-4431-bad2-dc19ea9ff3e7',
      type: String,
    }),
    ApiParam({
      name: 'moverId',
      description: '기사 ID (UUID)',
      example: '89127260-7cc3-4706-b457-adb90a45cddf',
      type: String,
    }),
    ApiResponse({
      status: 200,
      description: '견적 제안 상세 조회 성공',
      schema: { example: EstimateOfferResponseDto },
    }),
    ApiResponse(CODE_400_BAD_REQUEST([])),
    ApiResponse(CODE_401_RESPONSES),
    ApiResponse({
      status: 403,
      description: '권한 없음. 본인의 요청이 아닐 경우',
    }),
  );
}
