export class CreateAdminDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    displayName?: string;
    phone: string;
    salt?: string;
    profile?: string;
    role?: string[];
    isAdmin?: boolean;
}