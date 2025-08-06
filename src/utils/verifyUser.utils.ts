import { UserService } from '@modules/user/services/user.service';

export async function verifyUser(
  providedUserId: string,
  email: string,
  userService: UserService,
) {
  const user = await userService.findOne(email);
  if (!(user?.user_id === providedUserId) || !user.phone || !user.address)
    return false;

  return true;
}
