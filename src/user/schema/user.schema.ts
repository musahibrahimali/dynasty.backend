/*
* ########################################################
* ################## IMPORTS #############################
* ########################################################
* */

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import {IsArray, IsBoolean, IsEmail, IsPhoneNumber, IsString} from "class-validator";
import { Document } from "mongoose";
import {Exclude, Type} from "class-transformer";
import * as mongoose from "mongoose";
import {Role} from "@common/enums/role.enum";
import {Product} from "@product/schemas/product.schema";

export type UserModel = User & Document;

@Schema({timestamps: true})
export class User {
    @IsString()
    @Prop({required: false})
    social: string;

    @IsEmail()
    @Prop({required: true, unique: true})
    email: string;

    @IsString()
    @Prop({required: false})
    username: string;

    @IsString()
    @Exclude()
    @Prop({required: false})
    password: string;

    @IsString()
    @Prop({required: true})
    firstName: string;

    @IsString()
    @Prop({required: true})
    lastName: string;

    @IsString()
    @Prop({required: true})
    displayName: string;

    @IsPhoneNumber()
    @Prop({required: false})
    phone: string;

    @IsString()
    @Prop({required: false})
    gender?: string;

    @IsString()
    @Exclude()
    @Prop({required: false})
    salt: string;

    @IsString()
    @Exclude()
    @Prop({required: false})
    passwordResetKey?: string;

    @IsString()
    @Prop({required: false})
    avatar: string;

    @IsArray()
    @Prop({required: false, default: []})
    roles: Role[];

    @IsArray()
    @Prop({required:false, default: [], type: [{ type: mongoose.Schema.Types.ObjectId, ref: Product.name }]})
    @Type(() => Product)
    cart: Product[];

    @IsBoolean()
    @Prop({required: false})
    isAdmin: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
