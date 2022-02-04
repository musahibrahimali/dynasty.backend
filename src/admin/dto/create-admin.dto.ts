export class CreateAdminDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    displayName?: string;
    phone: string;
    salt?: string;
    profile?: string;
    salt?: string;
    role?: string[];
    isAdmin?: boolean;
}