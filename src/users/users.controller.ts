import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  CreateUserDto,
  LoginUserDto,
  RegisterUserDto,
} from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResponseMessage } from 'src/decorator/customize';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/roles/roles.enum';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // create a new user (admin only)
  @Post()
  @Roles(Role.Admin)
  @ResponseMessage('Create a new user')
  async create(@Body() createUserDto: CreateUserDto) {
    let newUser = await this.usersService.create(createUserDto);
    return {
      _id: newUser?._id,
      createdAt: newUser?.createdAt,
    };
  }

  // register a new user (anyone)
  @Post('register')
  @ResponseMessage('Register a new user')
  async register(@Body() registerUserDto: RegisterUserDto) {
    let newUser = await this.usersService.register(registerUserDto);
    return {
      _id: newUser?._id,
      createdAt: newUser?.createdAt,
    };
  }

  // login a user (anyone)
  @Post('login')
  @ResponseMessage('Login a user')
  async login(@Body() loginUserDto: LoginUserDto) {
    let user = await this.usersService.login(loginUserDto);
    return user;
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
    const foundUser = await this.usersService.findOne(id);
    return foundUser;
  }

  // update a user (admin only)
  @Patch()
  @Roles(Role.Admin)
  @ResponseMessage('Update a user')
  async update(@Body() updateUserDto: UpdateUserDto) {
    let updatedUser = await this.usersService.update(updateUserDto);
    return updatedUser;
  }

  // delete a user (admin only)
  @Delete(':id')
  @Roles(Role.Admin)
  @ResponseMessage('Delete a user')
  remove(@Param('id') id: number) {
    return this.usersService.remove(id);
  }
}
