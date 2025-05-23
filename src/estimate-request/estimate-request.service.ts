import { Injectable } from '@nestjs/common';
import { CreateEstimateRequestDto } from './dto/create-estimate-request.dto';
import { UpdateEstimateRequestDto } from './dto/update-estimate-request.dto';

@Injectable()
export class EstimateRequestService {
  create(createEstimateRequestDto: CreateEstimateRequestDto) {
    return 'This action adds a new estimateRequest';
  }

  findAll() {
    return `This action returns all estimateRequest`;
  }

  findOne(id: number) {
    return `This action returns a #${id} estimateRequest`;
  }

  update(id: number, updateEstimateRequestDto: UpdateEstimateRequestDto) {
    return `This action updates a #${id} estimateRequest`;
  }

  remove(id: number) {
    return `This action removes a #${id} estimateRequest`;
  }
}
