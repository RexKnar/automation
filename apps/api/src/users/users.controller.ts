import { Controller, Get, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AtGuard } from '../common/guards';
import { GetCurrentUser } from '../common/decorators';

@Controller('users')
@UseGuards(AtGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get('me')
  getMe(@GetCurrentUser('sub') userId: string) {
    return this.usersService.findOne(userId);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch('change-password')
  async changePassword(
    @GetCurrentUser('sub') userId: string,
    @Body() body: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(userId, body.current, body.new);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
