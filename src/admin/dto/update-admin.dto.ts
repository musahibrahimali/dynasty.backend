export class UpdateAdminDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  phone?: string;
  salt?: string;
  avatar?: string;
  roles?: string[];
  isAdmin?: boolean;
}
