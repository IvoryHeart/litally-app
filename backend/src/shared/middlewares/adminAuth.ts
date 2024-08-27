import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../utils/customError';
import User from '../../modules/user/user.model';
import { isAdmin } from '../utils/userUtils';

export const adminAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req.user as { id: string })?.id; //req.user?.id;
    if (!userId) {
      throw new CustomError('User not authenticated', 401);
    }

    /*
    const user = await User.findById(userId);
    if (!user || user.userType !== 'ADMIN') {
      throw new CustomError('Admin access required', 403);
    }
    */

    const adminStatus = await isAdmin(userId);
    if (!adminStatus) {
      throw new CustomError('Admin access required', 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};