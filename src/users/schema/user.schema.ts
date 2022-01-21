import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IsBoolean, IsEmail, IsPhoneNumber, IsString } from "class-validator";
import { Document } from "mongoose";

export type UsersModel = User & Document;

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
    salt: string;

    @IsString()
    @Prop({required: false})
    avatar: string;

    @IsString()
    @Prop({required: false})
    roles: string[];

    @IsBoolean()
    @Prop({required: false})
    isAdmin: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
