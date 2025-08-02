import { UserType } from './user.types';

export interface UserVerifyType {
    user: UserType;
    unique_string: string;
    expiring_at: Date;
}
