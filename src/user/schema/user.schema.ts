import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IsBoolean, IsEmail, IsPhoneNumber, IsString } from "class-validator";
import { Document } from "mongoose";

export type UserModel = User & Document;

@Schema({timestamps: true})
export class User {
    @IsString()
    @Prop({required: false, default: ''})
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
    @Prop({required: false})
    displayName: string;

    @IsPhoneNumber()
    @Prop({required: false})
    phone: string;

    @IsString()
    @Prop({required: false, default: 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'})
    profile: string;

    @IsString()
    @Prop({required: false, default: ['user']})
    role: string[];

    @IsBoolean()
    @Prop({required: false, default: false})
    isAdmin: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
