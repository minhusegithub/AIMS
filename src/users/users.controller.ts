import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, LoginUserDto, RegisterUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResponseMessage } from 'src/decorator/customize';


@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

 // 7 method 

  // create a new user
  @Post()
  @ResponseMessage('Create a new user')
  async create(
    @Body() createUserDto: CreateUserDto ,
    ) {
    let newUser = await this.usersService.create(createUserDto);
    return {
      _id: newUser?._id,
      createdAt: newUser?.createdAt
    }
  }

  // register a new user
  @Post('register')
  @ResponseMessage('Register a new user')
  async register(
    @Body() registerUserDto: RegisterUserDto
  ) {
    let newUser = await this.usersService.register(registerUserDto);
    return {
      _id: newUser?._id,
      createdAt: newUser?.createdAt
    }
  }

  // login a user
  @Post('login')
  @ResponseMessage('Login a user')
  async login(
    @Body() loginUserDto: LoginUserDto
  ) {
    let user = await this.usersService.login(loginUserDto);
    return user;
  }



  // get all users
  @Get()
  @ResponseMessage('Fetch users with pagination')
  findAll(
    @Query('current') currentPage: string ,
    @Query('pageSize') limit: string,
    @Query() qs: string
  ) {
    
    return this.usersService.findAll(+currentPage, +limit, qs);
  }

  // get a user by id
  @Get(':id')
  @ResponseMessage('Fetch a user by id')
  async findOne(
    @Param('id') id: string
  ) {
    const foundUser = await this.usersService.findOne(id);
    return foundUser;
  }


  // update a user
  @ResponseMessage('Update a user')
  @Patch()
  async update(
    @Body() updateUserDto: UpdateUserDto ,
  ) {
    let updatedUser = await this.usersService.update( updateUserDto);
    return updatedUser;
  }

  // delete a user
  @Delete(':id')
  @ResponseMessage('Delete a user')
  remove(
    @Param('id') id: number ,
  ) {
    return this.usersService.remove(id);
  }
}
