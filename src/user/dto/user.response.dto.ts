export class UserResponseDto{
    _id?:string;
    socialId: string;
    username: string;
    password: string;
    displayName: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    gender: string;
    salt: string;
    passwordResetKey: string;
    image: string;
    isAdmin: boolean;
    createdAt: Date;
    updatedAt: Date;
}