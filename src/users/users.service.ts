import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateUserDto,
  LoginUserDto,
  RegisterUserDto,
} from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { User as UserM, UserDocument } from './schemas/user.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import aqp from 'api-query-params';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(UserM.name) private userModel: SoftDeleteModel<UserDocument>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // Generate tokens
  private async generateTokens(user: UserDocument) {
    const payload = {
      sub: user._id,
      email: user.email,
      roles: [user.role],
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
        expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRE') || '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET') || 'refresh-secret',
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRE') || '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }

  // Set cookie options
  private getCookieOptions() {
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };
  }

  // Register a new user with cookie handling
  async registerWithCookie(user: RegisterUserDto, res: Response) {
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

    // Generate tokens for new user
    const tokens = await this.generateTokens(newRegister);
    
    // Save refresh token to database
    await this.userModel.findByIdAndUpdate(
      newRegister._id,
      { refreshToken: tokens.refreshToken },
      { new: true }
    );

    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', tokens.refreshToken, this.getCookieOptions());

    return {
      _id: newRegister._id,
      createdAt: newRegister.createdAt,
      accessToken: tokens.accessToken,
    };
  }

  // Login a user with cookie handling
  async loginWithCookie(loginUserDto: LoginUserDto, res: Response) {
    const { email, password } = loginUserDto;
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new UnauthorizedException('Email is incorrect');
    }

    const isMatchPassword = password === user.password;
    if (!isMatchPassword) {
      throw new UnauthorizedException('Password is incorrect');
    }

    // Generate new tokens
    const tokens = await this.generateTokens(user);
    
    // Save refresh token to database
    await this.userModel.findByIdAndUpdate(
      user._id,
      { refreshToken: tokens.refreshToken },
      { new: true }
    );

    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', tokens.refreshToken, this.getCookieOptions());

    return {
      user,
      accessToken: tokens.accessToken,
    };
  }

  // Logout user with cookie handling
  async logoutWithCookie(refreshToken: string, res: Response) {
    if (refreshToken) {
      try {
        const payload = await this.jwtService.verifyAsync(refreshToken, {
          secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET') || 'refresh-secret',
        });
        
        // Clear refresh token from database
        await this.userModel.findByIdAndUpdate(
          payload.sub,
          { refreshToken: null },
          { new: true }
        );
      } catch (error) {
        // Token invalid, just continue
      }
    }

    // Clear refresh token cookie
    res.clearCookie('refreshToken', this.getCookieOptions());
    
    return { message: 'Logout successful' };
  }

  // Refresh token with cookie handling
  async refreshTokenWithCookie(refreshToken: string, res: Response) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET') || 'refresh-secret',
      });

      const user = await this.userModel.findById(payload.sub);
      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Generate new tokens
      const tokens = await this.generateTokens(user);
      
      // Update refresh token in database
      await this.userModel.findByIdAndUpdate(
        user._id,
        { refreshToken: tokens.refreshToken },
        { new: true }
      );

      // Set new refresh token in httpOnly cookie
      res.cookie('refreshToken', tokens.refreshToken, this.getCookieOptions());

      return {
        accessToken: tokens.accessToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }



  // Refresh token
  async refreshToken(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET') || 'refresh-secret',
      });

      const user = await this.userModel.findById(payload.sub);
      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Generate new tokens
      const tokens = await this.generateTokens(user);
      
      // Update refresh token in database
      await this.userModel.findByIdAndUpdate(
        user._id,
        { refreshToken: tokens.refreshToken },
        { new: true }
      );

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }



  // Find one user by ID
  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new NotFoundException('ID người dùng không hợp lệ');
    }

    const user = await this.userModel.findById(id).select('-password -refreshToken');
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    return user;
  }

  // Update user profile (for current user)
  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new NotFoundException('ID người dùng không hợp lệ');
    }

    // Check if user exists
    const existingUser = await this.userModel.findById(userId);
    if (!existingUser) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    // Prepare update data - only include fields that have values
    const updateData: any = {};
    
    if (updateProfileDto.name !== undefined) {
      updateData.name = updateProfileDto.name.trim();
    }
    if (updateProfileDto.email !== undefined) {
      // Check if email already exists (if different from current)
      if (updateProfileDto.email !== existingUser.email) {
        const emailExists = await this.userModel.findOne({ email: updateProfileDto.email });
        if (emailExists) {
          throw new BadRequestException(`Email: ${updateProfileDto.email} đã tồn tại`);
        }
      }
      updateData.email = updateProfileDto.email.trim();
    }
    if (updateProfileDto.age !== undefined) {
      if (updateProfileDto.age < 0) {
        throw new BadRequestException('Tuổi không được âm');
      }
      updateData.age = updateProfileDto.age;
    }
    if (updateProfileDto.gender !== undefined) {
      updateData.gender = updateProfileDto.gender;
    }
    if (updateProfileDto.address !== undefined) {
      updateData.address = updateProfileDto.address.trim();
    }
    if (updateProfileDto.role !== undefined) {
      updateData.role = updateProfileDto.role;
    }

    // Update user
    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select('-password -refreshToken');

    return {
      success: true,
      message: 'Cập nhật thông tin thành công',
      data: updatedUser
    };
  }

  

  
}
