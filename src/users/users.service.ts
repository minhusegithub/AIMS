import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto, RegisterUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { User as UserM, UserDocument } from './schemas/user.schema';
import  {compareSync, genSaltSync , hashSync }  from 'bcryptjs';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from './users.interface';
import { User } from 'src/decorator/customize';
import aqp from 'api-query-params';

@Injectable()
export class UsersService {
  

  constructor(
    @InjectModel(UserM.name) private userModel: SoftDeleteModel<UserDocument>,
  ) {}

  getHashPassword = (password: string) =>{
    const salt = genSaltSync(10);
    const hash = hashSync(password, salt);
    return hash;
  }

  async register(user: RegisterUserDto) {
    const {name, email, password, age, gender, address} = user;

    const isExist = await this.userModel.findOne({email});
    if(isExist){
      throw new BadRequestException(`Email : ${email} đã tồn tại`);
    }
    const hashPassword = this.getHashPassword(password);
    let newRegister = await this.userModel.create({
      name,email,
      password: hashPassword,
      age,
      gender,
      address,
      role: 'USER'
    })
    return newRegister;
  }  

  // create a new user
  async create(createUserDto: CreateUserDto,  @User() user: IUser) {
    const {name, email, password, age, gender, address, role, company} = createUserDto;
    // Check email is exist
    const isExist = await this.userModel.findOne({email});
    if(isExist){
      throw new BadRequestException(`Email : ${email} đã tồn tại`);
    }

    const hashPassword = this.getHashPassword(password);
    let newUser = await this.userModel.create({
      name, email, password: hashPassword,
      age, gender, address, role, company,
      createdBy: {
        _id: user._id,
        email: user.email
      }
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
    .select('-password')
    .populate({
      path: "role",
      select: {
        name: 1,
        _id: 1,
      },
      populate: {
        path: "permissions",
        select: {
          name: 1,
          _id: 1
        }
      }
    });
  }


  findOneByUsername(username: string) {
    return this.userModel.findOne({
      email: username
    }).populate({
      path: "role",
      select: {
        name: 1,
        permissions: 1,
      }
    });
  }

  isValidPassword(password: string, hash: string) {
    return compareSync(password, hash);
  }

  // update user by id
  async update( updateUserDto: UpdateUserDto , user: IUser) {
    let updatedUser = await this.userModel.updateOne(
      {_id: updateUserDto._id},
      {
        ...updateUserDto,
        updatedBy: {
          _id: user._id,
          email: user.email}
      }
    )
    return updatedUser;
  }

  // remove user by id
  async remove(id: number , @User() user: IUser) {
    if(!mongoose.Types.ObjectId.isValid(id)){
      return "not found user";
    }

    await this.userModel.updateOne({_id: id}, {
      deletedBy: {
        _id: user._id,
        email: user.email
      }
    })
    return await this.userModel.softDelete({_id: id});
  }

  updateUserToken = async ( refreshToken: string , _id :string) => {
    return await this.userModel.updateOne(
      {_id},
      { refreshToken }
    );
  }

  findUserByToken = async (refreshToken: string) => {
    return await this.userModel.findOne({refreshToken});
  }

 

}
