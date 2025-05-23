import { Injectable } from '@nestjs/common';
import { CreateMoverProfileDto } from './dto/create-mover-profile.dto';
import { UpdateMoverProfileDto } from './dto/update-mover-profile.dto';

@Injectable()
export class MoverProfileService {
  create(createMoverProfileDto: CreateMoverProfileDto) {
    return 'This action adds a new moverProfile';
  }

  findAll() {
    return `This action returns all moverProfile`;
  }

  findOne(id: number) {
    return `This action returns a #${id} moverProfile`;
  }

  update(id: number, updateMoverProfileDto: UpdateMoverProfileDto) {
    return `This action updates a #${id} moverProfile`;
  }

  remove(id: number) {
    return `This action removes a #${id} moverProfile`;
  }
}
