import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
} from '@nestjs/common';
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
  ApiGetMoverProfileById,
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

  @Get()
  @Public()
  @ApiGetMoverProfiles()
  findAll(@UserInfo() userInfo: UserInfo, @Query() dto: GetMoverProfilesDto) {
    return this.moverProfileService.findAll(userInfo, dto);
  }

  @Get('me')
  @ApiGetMyMoverProfile()
  findMe(@UserInfo() userInfo: UserInfo) {
    return this.moverProfileService.findMe(userInfo.sub);
  }

  @Get(':id')
  @Public()
  @ApiGetMoverProfileById()
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
