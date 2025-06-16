import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from './users.interface';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ResponseMessage('Create a new user')
  async create(
    @Body() createUserDto: CreateUserDto ,
    @User() user: IUser
    ) {
    let newUser = await this.usersService.create(createUserDto , user);
    return {
      _id: newUser?._id,
      createdAt: newUser?.createdAt
    }
  }

  @Get()
  @ResponseMessage('Fetch users with pagination')
  findAll(
    @Query('current') currentPage: string ,
    @Query('pageSize') limit: string,
    @Query() qs: string
  ) {
    
    return this.usersService.findAll(+currentPage, +limit, qs);
  }

  @Get(':id')
  @ResponseMessage('Fetch a user by id')
  async findOne(
    @Param('id') id: string
  ) {
    const foundUser = await this.usersService.findOne(id);
    return foundUser;
  }

  @ResponseMessage('Update a user')
  @Patch()
  async update(
    @Body() updateUserDto: UpdateUserDto ,
    @User() user: IUser
  ) {
    let updatedUser = await this.usersService.update( updateUserDto, user);
    return updatedUser;
  }

  @Delete(':id')
  @ResponseMessage('Delete a user')
  remove(
    @Param('id') id: number ,
    @User() user: IUser
  ) {
    return this.usersService.remove(id, user);
  }
}
