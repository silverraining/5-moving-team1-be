import { Injectable } from '@nestjs/common';
import { CreateEstimateOfferDto } from './dto/create-estimate-offer.dto';
import { UpdateEstimateOfferDto } from './dto/update-estimate-offer.dto';

@Injectable()
export class EstimateOfferService {
  create(createEstimateOfferDto: CreateEstimateOfferDto) {
    return 'This action adds a new estimateOffer';
  }

  findAll() {
    return `This action returns all estimateOffer`;
  }

  findOne(id: number) {
    return `This action returns a #${id} estimateOffer`;
  }

  update(id: number, updateEstimateOfferDto: UpdateEstimateOfferDto) {
    return `This action updates a #${id} estimateOffer`;
  }

  remove(id: number) {
    return `This action removes a #${id} estimateOffer`;
  }
}
