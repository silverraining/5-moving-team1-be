import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MoverProfileService } from './mover-profile.service';
import { CreateMoverProfileDto } from './dto/create-mover-profile.dto';
import { UpdateMoverProfileDto } from './dto/update-mover-profile.dto';

@Controller('mover-profile')
export class MoverProfileController {
  constructor(private readonly moverProfileService: MoverProfileService) {}

  @Post()
  create(@Body() createMoverProfileDto: CreateMoverProfileDto) {
    return this.moverProfileService.create(createMoverProfileDto);
  }

  @Get()
  findAll() {
    return this.moverProfileService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.moverProfileService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMoverProfileDto: UpdateMoverProfileDto) {
    return this.moverProfileService.update(+id, updateMoverProfileDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.moverProfileService.remove(+id);
  }
}
