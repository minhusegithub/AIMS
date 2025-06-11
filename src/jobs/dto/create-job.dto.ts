import { Transform, Type } from "class-transformer";
import { IsArray, IsBoolean, IsDate, IsNotEmpty, IsNotEmptyObject, IsObject,
     IsString, ValidateNested } from "class-validator";
import mongoose from "mongoose";

    

export class Company {
    @IsNotEmpty()
    _id: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    logo: string;
}

export class CreateJobDto {
    @IsNotEmpty({message: "Name không được để trống!"})
    name: string;

    @IsNotEmpty({message: "Skills không được để trống!"})
    @IsArray({message: "Skills phải là một mảng!"})
    @IsString({each: true, message: "Mỗi phần tử trong skills phải là một chuỗi!"})
    skills: string[];

    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => Company)
    company: Company;

    @IsNotEmpty({message: "Salary không được để trống!"})
    salary: number;

    @IsNotEmpty({message: "Quantity không được để trống!"})
    quantity: number;

    @IsNotEmpty({message: "Level không được để trống!"})
    level: string;
    
    @IsNotEmpty({message: "Description không được để trống!"})
    description: string;
    
    @IsNotEmpty({message: "Location không được để trống!"})
    location: string;

    @IsNotEmpty({message: "Start date không được để trống!"})
    @Transform(({value}) => new Date(value))
    @IsDate({message: "startDate có định dạng phải là Date!"})
    startDate: Date;

    @IsNotEmpty({message: "End date không được để trống!"})
    @Transform(({value}) => new Date(value))
    @IsDate({message: "endDate có định dạng là Date!"})
    endDate: Date;

    @IsNotEmpty({message: "IsActive không được để trống!"})
    @IsBoolean({message: "IsActive có định dạng là boolean!"})
    isActive: boolean;
    
    



}
