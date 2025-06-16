import { IsNotEmpty } from "class-validator";

export class CreateProductDto {
    @IsNotEmpty({message: 'Tên sản phẩm không được để trống'})
    title: string;

    @IsNotEmpty({message: 'Mô tả sản phẩm không được để trống'})
    description: string;

    @IsNotEmpty({message: 'Giá sản phẩm không được để trống'})
    price: number;

    @IsNotEmpty({message: 'Số lượng sản phẩm không được để trống'})
    stock: number;

    
}
