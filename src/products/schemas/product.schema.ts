import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';


export type ProductDocument = HydratedDocument<Product>;

@Schema({timestamps: true})
export class Product {
    @Prop()
    title: string;

    @Prop()
    description: string;

    @Prop()
    price: number;

    @Prop()
    stock: number;

    
   

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;

    @Prop()
    isDeleted: boolean;

    @Prop()
    deletedAt: Date;
  
}

export const ProductSchema = SchemaFactory.createForClass(Product);
