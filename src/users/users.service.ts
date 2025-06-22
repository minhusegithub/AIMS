import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  CreateUserDto,
  LoginUserDto,
  RegisterUserDto,
} from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { User as UserM, UserDocument } from './schemas/user.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import aqp from 'api-query-params';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(UserM.name) private userModel: SoftDeleteModel<UserDocument>,
    private readonly jwtService: JwtService,
  ) {}

  // Register a new user
  async register(user: RegisterUserDto) {
    const { name, email, password, age, gender, address, role } = user;

    const isExist = await this.userModel.findOne({ email });
    if (isExist) {
      throw new BadRequestException(`Email: ${email} đã tồn tại`);
    }

    const newRegister = await this.userModel.create({
      name,
      email,
      password,
      age,
      gender,
      address,
      role,
    });

    return newRegister;
  }

  // Create a new user (admin only)
  async create(createUserDto: CreateUserDto) {
    const { name, email, password, age, gender, address, role } = createUserDto;

    if (role === 'admin') {
      throw new BadRequestException('Bạn không có quyền tạo admin');
    }

    const isExist = await this.userModel.findOne({ email });
    if (isExist) {
      throw new BadRequestException(`Email: ${email} đã tồn tại`);
    }

    const newUser = await this.userModel.create({
      name,
      email,
      password,
      age,
      gender,
      address,
      role,
    });

    return newUser;
  }

  // Login a user
  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new UnauthorizedException('Email is incorrect');
    }

    const isMatchPassword = password === user.password;
    if (!isMatchPassword) {
      throw new UnauthorizedException('Password is incorrect');
    }

    const payload = {
      sub: user._id,
      email: user.email,
      roles: [user.role],
    };

    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user,
    };
  }

  // Find all users
  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    const offset = (+currentPage - 1) * (+limit);
    const defaultLimit = +limit || 10;

    const totalItems = await this.userModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.userModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .select('-password')
      .populate(population)
      .exec();

    return {
      meta: {
        current: +currentPage,
        pageSize: +limit,
        pages: totalPages,
        total: totalItems,
      },
      result,
    };
  }

  // Find one user by ID
  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return 'not found user';
    }

    return await this.userModel.findById(id).select('-password');
  }

  // Update user
  async update(updateUserDto: UpdateUserDto) {
    return await this.userModel.updateOne(
      { _id: updateUserDto._id },
      { ...updateUserDto },
    );
  }

  // Soft delete user
  async remove(id: number) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return 'not found user';
    }

    return await this.userModel.softDelete({ _id: id });
  }
}
