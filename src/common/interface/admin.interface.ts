import { Document } from "mongoose";

interface IAdmin extends Document{
    readonly _id?: string;
    readonly password: string;
    readonly email?: string;
    readonly firstName?: string;
    readonly lastName?: string;
    readonly displayName?: string;
    readonly salt?: string;
    readonly avatar?: string | any;
    readonly roles?: string[];
    readonly isAdmin?: boolean;
    readonly createdAt?: Date;
    readonly updatedAt?: Date;
}

export default IAdmin;