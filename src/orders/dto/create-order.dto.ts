import { IsNotEmpty } from "class-validator";



export class CreateOrderDto {
    @IsNotEmpty({message: 'Cart id không được để trống'})
    cartId: string;

    // @IsNotEmpty({message: 'Status không được để trống'})
    // status: string;


    @IsNotEmpty({message: 'Place rush order không được để trống'})
    placeRushOrder: boolean;

    @IsNotEmpty({message: 'Payment method không được để trống'})
    paymentMethod: string;


}
