import { Controller, Get, Post, Body, Patch } from '@nestjs/common';
import { MoverProfileService } from './mover-profile.service';
import { CreateMoverProfileDto } from './dto/create-mover-profile.dto';
import { UpdateMoverProfileDto } from './dto/update-mover-profile.dto';
import { RBAC } from 'src/auth/decorator/rbac.decorator';
import { Role } from 'src/user/entities/user.entity';
import { UserInfo } from 'src/user/decorator/user-info.decorator';
import { Public } from 'src/auth/decorator/public.decorator';
import { GetMoverProfilesDto } from './dto/get-mover-profiles.dto';

@Controller('mover')
@RBAC(Role.MOVER) // mover만 접근 가능, customer은 접근 불가
export class MoverProfileController {
  constructor(private readonly moverProfileService: MoverProfileService) {}

  @Post()
  create(
    @Body() createMoverProfileDto: CreateMoverProfileDto,
    @UserInfo() userInfo: UserInfo,
  ) {
    return this.moverProfileService.create(createMoverProfileDto, userInfo);
  }

  @Get()
  @Public()
  findAll(@Body() getMoverProfilesDto: GetMoverProfilesDto) {
    return this.moverProfileService.findAll(getMoverProfilesDto);
  }

  @Get('me')
  findOne(@UserInfo() userInfo: UserInfo) {
    return this.moverProfileService.findOne(userInfo.sub);
  }

  @Patch('me')
  update(
    @UserInfo() userInfo: UserInfo,
    @Body() updateMoverProfileDto: UpdateMoverProfileDto,
  ) {
    return this.moverProfileService.update(userInfo.sub, updateMoverProfileDto);
  }
}
