import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  CODE_200_SUCCESS,
  CODE_201_CREATED,
  CODE_400_BAD_REQUEST,
  CODE_401_RESPONSES,
  CODE_404_NOT_FOUND,
  CODE_500_INTERNAL_SERVER_ERROR,
} from '@/common/docs/response.swagger';
import {
  MessageSchema,
  CustomerProfileSchema,
  CustomerProfileDetailSchema,
} from '@/common/docs/schema.swagger';
import {
  CreateCustomerProfileFullExample,
  UpdateCustomerProfileFullExample,
} from '@/common/docs/body.swagger';
import {
  nicknameValidationError,
  imageUrlValidationError,
  introValidationError,
  descriptionValidationError,
  serviceTypeValidationError,
  serviceRegionValidationError,
} from '@/common/docs/validation.swagger';
import { CreateCustomerProfileDto } from '../dto/create-customer-profile.dto';
import { UpdateCustomerProfileDto } from '../dto/update-customer-profile.dto';

export function ApiCreateCustomerProfile() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: '[customer] 프로필 생성',
      description: `
- [customer]가 처음 프로필을 등록할 때 사용하는 API입니다.
- 필수 필드를 포함해 프로필 정보를 입력해야 합니다.
      `,
    }),
    ApiBody({
      type: CreateCustomerProfileDto,
      examples: {
        fullExample: CreateCustomerProfileFullExample,
      },
    }),
    ApiResponse(
      CODE_201_CREATED({
        description: '[customer] 프로필 생성 성공',
        schema: CustomerProfileSchema,
      }),
    ),
    ApiResponse(
      CODE_400_BAD_REQUEST([
        imageUrlValidationError,
        serviceTypeValidationError,
        serviceRegionValidationError,
      ]),
    ),
    ApiResponse(CODE_401_RESPONSES),
  );
}

export function ApiGetMyCustomerProfile() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: '나의 [customer] 프로필 조회',
      description: `
- 로그인한 본인의 [customer] 프로필 정보를 조회합니다.
- 프로필이 존재하지 않으면 404 에러가 발생합니다.
      `,
    }),
    ApiResponse(
      CODE_200_SUCCESS({
        description: '본인의 [customer] 프로필 조회 성공',
        schema: CustomerProfileDetailSchema,
      }),
    ),
    ApiResponse(CODE_401_RESPONSES),
    ApiResponse(
      CODE_404_NOT_FOUND({
        description: '본인의 [customer] 프로필이 존재하지 않는 경우',
        message: '고객님의 프로필을 찾을 수 없습니다!',
      }),
    ),
  );
}

export function ApiUpdateMyCustomerProfile() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: '나의 [customer] 프로필 수정',
      description: `
- 나의 [customer] 프로필을 부분적으로 수정할 수 있습니다.
- 모든 필드는 선택적으로 수정 가능합니다.
      `,
    }),
    ApiBody({
      type: UpdateCustomerProfileDto,
      examples: {
        fullExample: UpdateCustomerProfileFullExample,
      },
    }),
    ApiResponse(
      CODE_200_SUCCESS({
        description: '[customer] 프로필 수정 성공',
        schema: MessageSchema(
          '고객님의 프로필이 성공적으로 업데이트되었습니다.',
        ),
      }),
    ),
    ApiResponse(
      CODE_400_BAD_REQUEST([
        nicknameValidationError,
        imageUrlValidationError,
        introValidationError,
        descriptionValidationError,
      ]),
    ),
    ApiResponse(CODE_401_RESPONSES),
    ApiResponse(
      CODE_500_INTERNAL_SERVER_ERROR({
        description: '프로필 수정 중 서버 오류 발생',
        message: '고객님의 프로필 수정에 실패했습니다!',
      }),
    ),
  );
}
