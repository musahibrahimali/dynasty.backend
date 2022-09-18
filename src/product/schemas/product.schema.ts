import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {IsArray, IsNumber, IsString} from "class-validator";
import {Document} from "mongoose";

export type ProductsModel = Product & Document;

@Schema({timestamps: true})
export class Product {
    @IsString()
    @Prop({required: true})
    name: string;

    @IsString()
    @Prop({required: true})
    description: string;

    @IsNumber()
    @Prop({required: true})
    price: number;

    @IsArray()
    @Prop({required: true})
    images: string[];

    @IsString()
    @Prop({required: true})
    category: string;

    @IsString()
    @Prop({required: true})
    brand: string;

    @IsNumber()
    @Prop({required: false})
    rating: number;

    @IsNumber()
    @Prop({required: false})
    numReviews: number;

    @IsNumber()
    @Prop({required: true})
    numInStock: number;

    @IsArray()
    @Prop({required: true})
    colors: string[];

    @IsArray()
    @Prop({required: true})
    sizes: string[];
}

export const ProductSchema = SchemaFactory.createForClass(Product);