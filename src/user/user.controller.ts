import { Controller, Body, Patch } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserInfo } from './decorator/user-info.decorator';
import { ApiUpdateMe } from './docs/swagger';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  //User 기본정보 수정 API
  @Patch('me')
  @ApiUpdateMe()
  async update(
    @UserInfo() userInfo: UserInfo,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.userService.update(userInfo.sub, updateUserDto);
  }
}
