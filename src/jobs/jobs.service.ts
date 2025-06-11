import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { IUser } from 'src/users/users.interface';
import { Job, JobDocument } from './schemas/job.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { InjectModel } from '@nestjs/mongoose';
import aqp from 'api-query-params';
import mongoose from 'mongoose';


@Injectable()
export class JobsService {

  constructor(
    @InjectModel(Job.name) private jobModel: SoftDeleteModel<JobDocument>
  ) {}

  async create(createJobDto: CreateJobDto, user: IUser) {
    const {
      name , skills , company , salary ,
       level , description , startDate , location,
      endDate , quantity , isActive
    } = createJobDto;

    let newJob = await this.jobModel.create({
      name , skills , company , salary ,
       level , description , startDate , location,
      endDate , quantity , isActive ,
      createdBy: {
        _id: user._id,
        email: user.email
      }
    });

    return {
      _id: newJob?._id,
      createdAt: newJob?.createdAt
    }  
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const {filter, sort, population} = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;
   

    const totalItems = (await this.jobModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.jobModel.find(filter)
      .skip(offset)
      .limit(+defaultLimit)
      .sort(sort as any)
      .populate(population)
      .exec();

     return {
      meta: {
        current: currentPage,
        pageSize: limit,
        total: totalItems,
        totalPages: totalPages
      },
      result
     }

  }

  async findOne(id: string) {
    if(!mongoose.Types.ObjectId.isValid(id)) {
      return 'not found job';
    }
    return await this.jobModel.findById(id);
  }

  async update(id: string, updateJobDto: UpdateJobDto, user: IUser) {
    const updated = await this.jobModel.updateOne(
      {_id: id},
      {
        ...updateJobDto,
        updatedBy: {
          _id: user._id,
          email: user.email
        }
      } );

    return updated;


  }

  async remove(id: string, user: IUser) {
    if(!mongoose.Types.ObjectId.isValid(id)) {
      return 'not found job';
    }
    await this.jobModel.updateOne(
      {_id: id},
      {
        deletedBy: {
          _id: user._id,
          email: user.email
        }
      });
    return await this.jobModel.softDelete({_id: id});
  }
}
