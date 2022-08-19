import { Document } from "mongoose";

interface IUser extends Document {
    readonly _id?: string;
    readonly social?: string;
    readonly username: string;
    readonly email?: string;
    readonly firstName?: string;
    readonly lastName?: string;
    readonly password?: string;
    readonly image?: string;
    readonly salt?: string;
    readonly passwordResetKey?: string;
    readonly roles?: string[],
    readonly isAdmin?: boolean,
    readonly createdAt?: Date;
    readonly updatedAt?: Date;
}

export default IUser;