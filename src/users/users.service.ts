import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import  {compareSync, genSaltSync , hashSync }  from 'bcryptjs';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';


@Injectable()
export class UsersService {

  constructor(
    @InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>,
  ) {}

  getHashPassword = (password: string) =>{
    const salt = genSaltSync(10);
    const hash = hashSync(password, salt);
    return hash;
  }

  



  // create a new user
  async create(createUserDto: CreateUserDto) {
   
    const hashPassword = this.getHashPassword(createUserDto.password);

    let user = await this.userModel.create({
      email: createUserDto.email, 
      password: hashPassword, 
      name: createUserDto.name,
      address: createUserDto.address
    });
    return user;
  }

  // find all users
  async findAll() {
    return await this.userModel.find();
  }


  // find one user by id
  async findOne(id: string) {
    if(!mongoose.Types.ObjectId.isValid(id)){
      return "not found user";
    }
    return await this.userModel.findOne({_id: id});
  }


  
  findOneByUsername(username: string) {
    return this.userModel.findOne({email: username});
  }

  isValidPassword(password: string, hash: string) {
    return compareSync(password, hash);
  }

  // update user by id
  async update( updateUserDto: UpdateUserDto) {
    return await this.userModel.updateOne( 
      {_id: updateUserDto._id}, 
      {
        ...updateUserDto
      }
    );
  }

  // remove user by id
  async remove(id: number) {
    if(!mongoose.Types.ObjectId.isValid(id)){
      return "not found user";
    }

    return await this.userModel.softDelete({_id: id});

  }
}
