import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { IUser } from 'src/users/users.interface';
import { Permission, PermissionDocument } from './schemas/permission.schema';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import aqp from 'api-query-params';
import mongoose from 'mongoose';

@Injectable()
export class PermissionsService {

  constructor(
    @InjectModel(Permission.name) private permissionModel: SoftDeleteModel<PermissionDocument>,
  ) {}

  async create(createPermissionDto: CreatePermissionDto, user: IUser) {
    const {name, apiPath, method, module} = createPermissionDto;
    const isExist = await this.permissionModel.findOne({apiPath, method});
    if (isExist) {
      throw new BadRequestException('Permission với apiPath và method đã tồn tại');
    }

    const newPermission = await this.permissionModel.create({
      name ,  apiPath,
      method, module,
      createdBy: {
        _id: user._id,
        email: user.email,
      }
    });


    return {
      _id: newPermission?._id,
      createdAt: newPermission?.createdAt,
    }
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const {filter, sort, projection, population} = aqp(qs);
    delete filter.current;
    delete filter.pageSize;


    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.permissionModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.permissionModel.find(filter)
    .skip(offset)
    .limit(defaultLimit)
    .sort(sort as any)
    .populate(population)
    .select(projection as any)
    .exec();
    
    return {
      meta: {
        current: currentPage,
        pageSize: limit,
        pages: totalItems,
        total: totalPages,
      },
      result
    }


  }

  async findOne(id: string) {
    if(mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('not found permission');
    }
    return await this.permissionModel.findById(id);
  }

  async update(id: string, updatePermissionDto: UpdatePermissionDto, user: IUser) {
    if(mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('not found permission');
    }

    const {module, name, apiPath, method} = updatePermissionDto;

    const updated = await this.permissionModel.updateOne(
      {_id: id},
      {
        module, name, apiPath, method,
        updatedBy: {
          _id: user._id,
          email: user.email,
        }
      })
    return updated;
  }

  async remove(id: string , user: IUser) {
    await this.permissionModel.updateOne(
      {_id: id}, 
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        }
      })
    return await this.permissionModel.softDelete(
      {_id: id}
    );
  }
}
