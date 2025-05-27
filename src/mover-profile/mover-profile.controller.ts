import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { MoverProfileService } from './mover-profile.service';
import { CreateMoverProfileDto } from './dto/create-mover-profile.dto';
import { UpdateMoverProfileDto } from './dto/update-mover-profile.dto';
import { RBAC } from 'src/auth/decorator/rbac.decorator';
import { Role } from 'src/user/entities/user.entity';
import { UserInfo } from 'src/user/decorator/user-info.decorator';

@Controller('mover')
export class MoverProfileController {
  constructor(private readonly moverProfileService: MoverProfileService) {}

  @Post()
  @RBAC(Role.MOVER) // mover만 접근 가능, customer은 접근 불가
  create(
    @Body() createMoverProfileDto: CreateMoverProfileDto,
    @UserInfo() userInfo: UserInfo,
  ) {
    return this.moverProfileService.create(createMoverProfileDto, userInfo);
  }

  @Get()
  findAll() {
    return this.moverProfileService.findAll();
  }

  @Get('me')
  @RBAC(Role.MOVER)
  findOne(@UserInfo() userInfo: UserInfo) {
    return this.moverProfileService.findOne(userInfo.sub);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMoverProfileDto: UpdateMoverProfileDto,
  ) {
    return this.moverProfileService.update(+id, updateMoverProfileDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.moverProfileService.remove(+id);
  }
}
