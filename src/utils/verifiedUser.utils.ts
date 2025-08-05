import { User } from '@modules/user/entities/user.entity';

export function verifiedUser(providedUserId: string, user: User | undefined) {
  if (!(user?.user_id === providedUserId) || !user.password || !user.address)
    return false;

  return true;
}
