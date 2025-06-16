import { PartialType } from '@nestjs/mapped-types';
import { CreateEstimateRequestDto } from './create-estimate-request.dto';

export class UpdateEstimateRequestDto extends PartialType(CreateEstimateRequestDto) {}
