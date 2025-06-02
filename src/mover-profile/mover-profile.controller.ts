import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { MoverProfileService } from './mover-profile.service';
import { CreateMoverProfileDto } from './dto/create-mover-profile.dto';
import { UpdateMoverProfileDto } from './dto/update-mover-profile.dto';
import { RBAC } from 'src/auth/decorator/rbac.decorator';
import { Role } from 'src/user/entities/user.entity';
import { UserInfo } from 'src/user/decorator/user-info.decorator';
import { Public } from 'src/auth/decorator/public.decorator';
import { GetMoverProfilesDto } from './dto/get-mover-profiles.dto';
import {
  ApiCreateMoverProfile,
  ApiGetMoverProfiles,
  ApiGetMyMoverProfile,
  ApiUpdateMyMoverProfile,
} from './docs/swagger';

@Controller('mover')
@RBAC(Role.MOVER) // mover만 접근 가능, customer은 접근 불가
export class MoverProfileController {
  constructor(private readonly moverProfileService: MoverProfileService) {}

  @Post()
  @ApiCreateMoverProfile()
  create(
    @Body() createMoverProfileDto: CreateMoverProfileDto,
    @UserInfo() userInfo: UserInfo,
  ) {
    return this.moverProfileService.create(userInfo.sub, createMoverProfileDto);
  }

  /**
   * filter 조건 중 'serviceRegion'의 조건이 많아서
   * Param으로 받을 경우 URI가 길어지는 것을 방지하기 위해 Body로 받음
   * Body값과의 호환성을 위해 Get요청이 아닌 Post요청으로 구현
   * Post 요청으로 바꿈으로서 조회는 GET /mover가 아닌 POST /mover/search로 변경
   */

  @Post('search')
  @Public()
  @ApiGetMoverProfiles()
  findAll(@UserInfo() userInfo: UserInfo, @Body() dto: GetMoverProfilesDto) {
    return this.moverProfileService.findAll(userInfo, dto);
  }

  @Get('me')
  @ApiGetMyMoverProfile()
  findMe(@UserInfo() userInfo: UserInfo) {
    return this.moverProfileService.findMe(userInfo.sub);
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.moverProfileService.findOne(id);
  }

  @Patch('me')
  @ApiUpdateMyMoverProfile()
  update(
    @UserInfo() userInfo: UserInfo,
    @Body() updateMoverProfileDto: UpdateMoverProfileDto,
  ) {
    return this.moverProfileService.update(userInfo.sub, updateMoverProfileDto);
  }
}
