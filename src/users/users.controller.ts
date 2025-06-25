import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Res,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { UsersService } from './users.service';
import {
  CreateUserDto,
  LoginUserDto,
  RegisterUserDto,
} from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ResponseMessage } from 'src/decorator/customize';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/roles/roles.enum';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from './user.decorator';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  // register a new user (anyone)
  @Post('register')
  @ResponseMessage('Register a new user')
  async register(
    @Body() createUserDto: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.usersService.registerWithCookie(createUserDto, res);
  }

  // login a user (anyone)
  @Post('login')
  @ResponseMessage('Login a user')
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.usersService.loginWithCookie(loginUserDto, res);
  }

  // logout user
  @Post('logout')
  @ResponseMessage('Logout user')
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refreshToken;
    return this.usersService.logoutWithCookie(refreshToken, res);
  }

  // refresh token
  @Post('refresh')
  @ResponseMessage('Refresh access token')
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refreshToken;
    return this.usersService.refreshTokenWithCookie(refreshToken, res);
  }

  // get current user profile (authenticated users)
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Get current user profile')
  async getProfile(@CurrentUser() user: any) {
    return this.usersService.findOne(user.userId);
  }

  // update current user profile (authenticated users)
  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Update current user profile')
  async updateProfile(
    @CurrentUser() user: any,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.userId, updateProfileDto);
  }

  // get all users (admin only)
  @Get()
  @Roles(Role.Admin)
  @ResponseMessage('Fetch users with pagination')
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
  ) {
    return this.usersService.findAll(+currentPage, +limit, qs);
  }

  // get a user by id (admin only)
  @Get(':id')
  @Roles(Role.Admin)
  @ResponseMessage('Fetch a user by id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  // update a user (admin only)
  @Patch()
  @Roles(Role.Admin)
  @ResponseMessage('Update a user')
  async update(@Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(updateUserDto);
  }

  // delete a user (admin only)
  @Delete(':id')
  @Roles(Role.Admin)
  @ResponseMessage('Delete a user')
  remove(@Param('id') id: number) {
    return this.usersService.remove(id);
  }
}
