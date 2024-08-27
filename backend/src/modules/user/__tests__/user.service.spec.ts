import * as userService from '../user.service';
import User from '../user.model';
import { CustomError } from '../../../shared/utils/customError';
import jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken');

describe('User Service', () => {
  describe('registerUser', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      const user = await userService.registerUser(userData);

      expect(user.email).toBe(userData.email);
      expect(user.firstName).toBe(userData.firstName);
      expect(user.lastName).toBe(userData.lastName);
      expect(user.userType).toBe('CUSTOMER');
      expect(user.passwordHash).not.toBe(userData.password);
    });

    it('should throw an error if user already exists', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'Existing',
        lastName: 'User',
      };

      await userService.registerUser(userData);

      await expect(userService.registerUser(userData)).rejects.toThrow(CustomError);
    });
  });

  describe('loginUser', () => {
    it('should login user successfully', async () => {
      const userData = {
        email: 'login@example.com',
        password: 'password123',
        firstName: 'Login',
        lastName: 'User',
      };

      await userService.registerUser(userData);

      (jwt.sign as jest.Mock).mockReturnValue('mocked-token');

      const { user, token } = await userService.loginUser(userData.email, userData.password);

      expect(user.email).toBe(userData.email);
      expect(token).toBe('mocked-token');
    });

    it('should throw an error for invalid credentials', async () => {
      await expect(userService.loginUser('nonexistent@example.com', 'wrongpassword')).rejects.toThrow(CustomError);
    });
  });

  describe('getUserProfile', () => {
    it('should return user profile', async () => {
      const userData = {
        email: 'profile@example.com',
        password: 'password123',
        firstName: 'Profile',
        lastName: 'User',
      };

      const registeredUser = await userService.registerUser(userData);

      const userProfile = await userService.getUserProfile(registeredUser.id);

      expect(userProfile.email).toBe(userData.email);
      expect(userProfile.firstName).toBe(userData.firstName);
      expect(userProfile.lastName).toBe(userData.lastName);
    });

    it('should throw an error if user not found', async () => {
      await expect(userService.getUserProfile(new User().id)).rejects.toThrow(CustomError);
    });
  });

  describe('updateUserProfile', () => {
    it('should update user profile successfully', async () => {
      const userData = {
        email: 'update@example.com',
        password: 'password123',
        firstName: 'Update',
        lastName: 'User',
      };

      const registeredUser = await userService.registerUser(userData);

      const updatedUser = await userService.updateUserProfile(registeredUser.id, {
        firstName: 'Updated',
        lastName: 'Name',
      });

      expect(updatedUser.firstName).toBe('Updated');
      expect(updatedUser.lastName).toBe('Name');
    });

    it('should throw an error if user not found', async () => {
      await expect(userService.updateUserProfile(new User().id, { firstName: 'Updated' })).rejects.toThrow(CustomError);
    });
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      await userService.registerUser({
        email: 'user1@example.com',
        password: 'password123',
        firstName: 'User1',
        lastName: 'Test',
      });

      await userService.registerUser({
        email: 'user2@example.com',
        password: 'password123',
        firstName: 'User2',
        lastName: 'Test',
      });

      const users = await userService.getAllUsers();

      expect(users.length).toBeGreaterThanOrEqual(2);
      expect(users.some(user => user.email === 'user1@example.com')).toBeTruthy();
      expect(users.some(user => user.email === 'user2@example.com')).toBeTruthy();
    });
  });

  describe('updateUserType', () => {
    it('should update user type successfully', async () => {
      const userData = {
        email: 'admin@example.com',
        password: 'password123',
        firstName: 'Admin',
        lastName: 'User',
      };

      const registeredUser = await userService.registerUser(userData);

      const updatedUser = await userService.updateUserType(registeredUser.id, 'ADMIN');

      expect(updatedUser.userType).toBe('ADMIN');
    });

    it('should throw an error if user not found', async () => {
      await expect(userService.updateUserType(new User().id, 'ADMIN')).rejects.toThrow(CustomError);
    });
  });
});