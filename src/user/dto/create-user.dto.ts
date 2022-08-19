export class CreateUserDto {
    socialId?: string;
    username: string;
    password?: string;
    fullName?: string;
    displayName?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    gender?: string;
    salt?: string;
    passwordResetKey?: string;
    avatar?: string;
    roles?: string[];
    isAdmin?: boolean;
}