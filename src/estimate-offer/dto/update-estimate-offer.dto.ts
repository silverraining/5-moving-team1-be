import { PartialType } from '@nestjs/mapped-types';
import { CreateEstimateOfferDto } from './create-estimate-offer.dto';

export class UpdateEstimateOfferDto extends PartialType(CreateEstimateOfferDto) {}
