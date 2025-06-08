// data transfer object
import { IsEmail, isNotEmpty, IsNotEmpty, IsString } from 'class-validator';

export class CreateCompanyDto {
    @IsNotEmpty({message: 'Tên công ty không được để trống'})
    name: string;

    @IsNotEmpty({message: 'Địa chỉ không được để trống'})
    address: string;
    
    @IsNotEmpty({message: 'Mô tả không được để trống'})
    description: string;

}
