export class CreateUserDto {
    social?: string;
    email: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    displayName?: string;
    phone?: string;
    profile?: string;
    salt?: string;
    role?: string[];
    isAdmin?: boolean;
}