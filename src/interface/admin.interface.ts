import { Document } from "mongoose";

interface IAdmin extends Document {
    readonly _id?: string;
    readonly email: string;
    readonly password: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly displayName?: string;
    readonly phone: string;
    readonly profile?: string;
    readonly salt?: string;
    readonly role?: string[];
    readonly isAdmin?: boolean;
    readonly createAt?: Date;
    readonly updateAt?: Date;
}
export default IAdmin;
