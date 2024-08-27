import { Request, Response, NextFunction } from 'express';
import * as userService from './user.service';
import { CustomError } from '../../shared/utils/customError';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await userService.registerUser(req.body);
    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await userService.loginUser(email, password);
    res.json({ message: 'Login successful', user, token });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req.user as { id: string })?.id; //req.user?.id;
    if (!userId) {
      throw new CustomError('User not authenticated', 401);
    }
    const user = await userService.getUserProfile(userId);
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req.user as { id: string })?.id; //req.user?.id;
    if (!userId) {
      throw new CustomError('User not authenticated', 401);
    }
    const updatedUser = await userService.updateUserProfile(userId, req.body);
    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    next(error);
  }
};

// Admin functions
export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await userService.getAllUsers();
    res.json({ users });
  } catch (error) {
    next(error);
  }
};

export const updateUserType = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const { userType } = req.body;
    if (userType !== 'CUSTOMER' && userType !== 'ADMIN') {
      throw new CustomError('Invalid user type', 400);
    }
    const updatedUser = await userService.updateUserType(userId, userType);
    res.json({ message: 'User type updated successfully', user: updatedUser });
  } catch (error) {
    next(error);
  }
};