import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IsBoolean, IsEmail, IsPhoneNumber, IsString } from "class-validator";
import { Document } from "mongoose";

export type AdminModel = Admin & Document;

@Schema({timestamps: true})
export class Admin {
    @IsEmail()
    @Prop({required: true, unique: true})
    email: string;

    @IsString()
    @Prop({required: true, minlength: 8 })
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
    @Prop({required: false })
    phone: string;

    @IsString()
    @Prop({required: false, default: 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'})
    profile: string;

    @IsString()
    @Prop({required: false,})
    salt: string;

    @IsString()
    @Prop({required: false, default: ['user', 'admin']})
    role: string[];

    @IsBoolean()
    @Prop({required: false, default: true})
    isAdmin: boolean;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
