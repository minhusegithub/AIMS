import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto, LoginUserDto, RegisterUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { User as UserM, UserDocument } from './schemas/user.schema';
import  {compareSync, genSaltSync , hashSync }  from 'bcryptjs';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import aqp from 'api-query-params';

@Injectable()
export class UsersService {
  

  constructor(
    @InjectModel(UserM.name) private userModel: SoftDeleteModel<UserDocument>,
  ) {}

 
  // register a new user
  async register(user: RegisterUserDto) {
    const {name, email, password, age, gender, address, role} = user;

    const isExist = await this.userModel.findOne({email});
    if(isExist){
      throw new BadRequestException(`Email : ${email} đã tồn tại`);
    }
   
    let newRegister = await this.userModel.create({
      name,email,
      password,
      age,
      gender,
      address,
      role
    })
    return newRegister;
  }  

  // create a new user
  async create(createUserDto: CreateUserDto) {
    const {name, email, password, age, gender, address, role} = createUserDto;

    if(role === 'admin'){
      throw new BadRequestException('Bạn không có quyền tạo admin');
    }

    // Check email is exist
    const isExist = await this.userModel.findOne({email});
    if(isExist){
      throw new BadRequestException(`Email : ${email} đã tồn tại`);
    }

    

    let newUser = await this.userModel.create({
      name, email, password,
      age, gender, address,
      role
    })
    return newUser;
  }


  // find all users
  async findAll(currentPage: number, limit: number, qs: string) {
    const {filter, sort,  population} = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;
    
    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    
    const result = await this.userModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .select("-password")
      .populate(population)
      .exec();

    return {
      meta: {
        current: +currentPage,
        pageSize: +limit,
        pages: totalPages,
        total: totalItems,
        
      },
      result
    }
  }


  // find one user by id
  async findOne(id: string) {
    if(!mongoose.Types.ObjectId.isValid(id)){
      return "not found user";
    }

    return await this.userModel.findOne(
      {_id: id}
    )
    .select('-password');
    
  }


  // login a user
  async login(loginUserDto: LoginUserDto) {
    const {email, password} = loginUserDto;
    const user = await this.userModel.findOne({email});
    if(!user){
      throw new BadRequestException('Email is incorrect');
    }
    const isMatchPassword = password === user.password;
    if(!isMatchPassword){
      throw new BadRequestException('password is incorrect');
    }
    return user;
  }
   

  // update user by id
  async update( updateUserDto: UpdateUserDto) {
    let updatedUser = await this.userModel.updateOne(
      {_id: updateUserDto._id},
      {
        ...updateUserDto,
      }
    )
    return updatedUser;
  }

  // remove user by id
  async remove(id: number) {
    if(!mongoose.Types.ObjectId.isValid(id)){
      return "not found user";
    }

    return await this.userModel.softDelete({_id: id});
  }

 


 

}
