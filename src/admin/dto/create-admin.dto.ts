export class CreateUserDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    displayName?: string;
    phone: string;
    profile?: string;
    role?: string[];
    isAdmin?: boolean;
}