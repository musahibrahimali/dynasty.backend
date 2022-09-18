import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import {IsArray, IsBoolean, IsEmail, IsPhoneNumber, IsString} from "class-validator";
import { Document } from "mongoose";
import {Role} from "../../common";

export type AdminModel = Admin & Document;

@Schema({timestamps: true})
export class Admin {
    @IsEmail()
    @Prop({required: true, unique: true})
    email: string;

    @IsString()
    @Prop({required: true, minlength: 8})
    password: string;

    @IsString()
    @Prop({required: true})
    firstName: string;

    @IsString()
    @Prop({required: true})
    lastName: string;

    @IsString()
    @Prop({required: false})
    displayName: string;

    @IsPhoneNumber()
    @Prop({required: false, minlength: 10, maxlength: 15})
    phone: string;

    @IsString()
    @Prop({required: false})
    avatar: string;

    @IsString()
    @Prop({required: false,})
    salt: string;

    @IsArray()
    @Prop({required: false})
    roles: Role[];

    @IsBoolean()
    @Prop({required: false})
    isAdmin: boolean;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
