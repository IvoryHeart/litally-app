import User, { IUser } from './user.model';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { CustomError } from '../../shared/utils/customError';
import logger from '../../shared/utils/logger';

export const registerUser = async (userData: Partial<IUser>  & { password: string }): Promise<IUser> => {
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    throw new CustomError('User already exists', 400);
  }

  // Hash the password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(userData.password, salt);

  const user = new User({
    ...userData,
    passwordHash,
    userType: 'CUSTOMER', // Default to CUSTOMER, only changeable from the DB

  });
  await user.save();
  return user;
};

export const loginUser = async (email: string, password: string): Promise<{ user: IUser; token: string }> => {
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    throw new CustomError('Invalid email or password', 401);
  }

  const token = jwt.sign({ id: user._id, userType: user.userType }, process.env.JWT_SECRET as string, { expiresIn: '1d' });
  return { user, token };
};

export const getUserProfile = async (userId: string): Promise<IUser> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new CustomError('User not found', 404);
  }
  return user;
};

export const updateUserProfile = async (userId: string, updateData: Partial<IUser>): Promise<IUser> => {
  const user = await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true });
  if (!user) {
    throw new CustomError('User not found', 404);
  }
  return user;
};

// Admin-specific operations
export const getAllUsers = async (): Promise<IUser[]> => {
  return User.find({});
};

export const updateUserType = async (userId: string, userType: 'CUSTOMER' | 'ADMIN'): Promise<IUser> => {
  const user = await User.findByIdAndUpdate(userId, { userType }, { new: true, runValidators: true });
  if (!user) {
    throw new CustomError('User not found', 404);
  }
  return user;
};