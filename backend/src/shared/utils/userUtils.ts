import { IUser } from '../../modules/user/user.model';
import User from '../../modules/user/user.model';

export const isAdmin = async (userId: string): Promise<boolean> => {
  const user = await User.findById(userId);
  return user?.userType === 'ADMIN';
};