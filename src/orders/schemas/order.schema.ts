import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Cart } from 'src/carts/schemas/cart.schema';

export type OrderDocument = HydratedDocument<Order>;

@Schema({timestamps: true})
export class Order {
    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cart'
    })
    cartId: mongoose.Types.ObjectId;

    @Prop()
    status: string;

    @Prop()
    totalPrice: number;

    @Prop()
    placeRushOrder: boolean;

    @Prop()
    paymentMethod: string;



    
    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;

    @Prop()
    isDeleted: boolean;

    @Prop()
    deletedAt: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
