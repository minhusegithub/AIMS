import { IsArray, IsNotEmpty, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import mongoose from "mongoose";

class CartProductDto {
    @IsNotEmpty({message: 'Product ID không được để trống'})
    productId: mongoose.Types.ObjectId;

    @IsNotEmpty({message: 'Số lượng không được để trống'})
    quantity: number;
}

export class CreateCartDto {
    @IsNotEmpty({message: 'User id không được để trống'})
    userId: string;

    @IsNotEmpty({message: 'Products không được để trống'})
    @IsArray({message: 'Products phải là một mảng'})
    @ValidateNested({each: true})
    @Type(() => CartProductDto)
    products: CartProductDto[];
}
