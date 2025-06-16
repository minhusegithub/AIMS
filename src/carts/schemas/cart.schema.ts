import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from 'src/users/schemas/user.schema';
import { Product } from 'src/products/schemas/product.schema';

export type CartDocument = HydratedDocument<Cart>;

@Schema({timestamps: true})
export class Cart {
    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    })
    userId: mongoose.Types.ObjectId;

    @Prop([{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        quantity: Number
    }])
    products: {
        productId: mongoose.Types.ObjectId;
        quantity: number;
    }[];

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;

    @Prop()
    isDeleted: boolean;

    @Prop()
    deletedAt: Date;
}

export const CartSchema = SchemaFactory.createForClass(Cart);
