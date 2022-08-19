export class ProfileInfoDto {
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
    roles: string[];
    isAdmin: boolean;
}
