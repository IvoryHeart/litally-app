import { Request, Response } from 'express';
import * as userController from '../user.controller';
import * as userService from '../user.service';
import { CustomError } from '../../../shared/utils/customError';

jest.mock('../user.service');

describe('User Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      body: {},
      params: {},
      user: { id: 'testUserId' },
    };
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const newUser = { email: 'test@example.com', password: 'password123', firstName: 'Test', lastName: 'User' };
      mockRequest.body = newUser;
      
      (userService.registerUser as jest.Mock).mockResolvedValue(newUser);

      await userController.register(mockRequest as Request, mockResponse as Response, mockNext);

      expect(userService.registerUser).toHaveBeenCalledWith(newUser);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User registered successfully', user: newUser });
    });

    it('should handle registration error', async () => {
      mockRequest.body = { email: 'test@example.com', password: 'password123', firstName: 'Test', lastName: 'User' };
      
      const error = new CustomError('User already exists', 400);
      (userService.registerUser as jest.Mock).mockRejectedValue(error);

      await userController.register(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const loginDetails = { email: 'test@example.com', password: 'password123' };
      mockRequest.body = loginDetails;
      
      const mockUser = { id: '123', email: 'test@example.com' };
      const mockToken = 'mock-jwt-token';
      (userService.loginUser as jest.Mock).mockResolvedValue({ user: mockUser, token: mockToken });

      await userController.login(mockRequest as Request, mockResponse as Response, mockNext);

      expect(userService.loginUser).toHaveBeenCalledWith(loginDetails.email, loginDetails.password);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Login successful', user: mockUser, token: mockToken });
    });

    it('should handle login error', async () => {
      mockRequest.body = { email: 'test@example.com', password: 'wrongpassword' };
      
      const error = new CustomError('Invalid email or password', 401);
      (userService.loginUser as jest.Mock).mockRejectedValue(error);

      await userController.login(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const userId = 'testUserId';
      mockRequest.user = { id: userId };
      
      const mockUserProfile = { id: userId, email: 'test@example.com', firstName: 'Test', lastName: 'User' };
      (userService.getUserProfile as jest.Mock).mockResolvedValue(mockUserProfile);

      await userController.getProfile(mockRequest as Request, mockResponse as Response, mockNext);

      expect(userService.getUserProfile).toHaveBeenCalledWith(userId);
      expect(mockResponse.json).toHaveBeenCalledWith({ user: mockUserProfile });
    });

    it('should handle error when user is not authenticated', async () => {
      mockRequest.user = undefined;

      await userController.getProfile(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(CustomError));
      expect(mockNext.mock.calls[0][0].message).toBe('User not authenticated');
      expect(mockNext.mock.calls[0][0].statusCode).toBe(401);
    });
  });

  describe('updateProfile', () => {
    it('should update user profile successfully', async () => {
      const userId = 'testUserId';
      mockRequest.user = { id: userId };
      const updateData = { firstName: 'Updated', lastName: 'Name' };
      mockRequest.body = updateData;
      
      const updatedUser = { id: userId, ...updateData };
      (userService.updateUserProfile as jest.Mock).mockResolvedValue(updatedUser);

      await userController.updateProfile(mockRequest as Request, mockResponse as Response, mockNext);

      expect(userService.updateUserProfile).toHaveBeenCalledWith(userId, updateData);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Profile updated successfully', user: updatedUser });
    });

    it('should handle error when user is not authenticated', async () => {
      mockRequest.user = undefined;

      await userController.updateProfile(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(CustomError));
      expect(mockNext.mock.calls[0][0].message).toBe('User not authenticated');
      expect(mockNext.mock.calls[0][0].statusCode).toBe(401);
    });
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const mockUsers = [{ id: '1', email: 'user1@example.com' }, { id: '2', email: 'user2@example.com' }];
      (userService.getAllUsers as jest.Mock).mockResolvedValue(mockUsers);

      await userController.getAllUsers(mockRequest as Request, mockResponse as Response, mockNext);

      expect(userService.getAllUsers).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith({ users: mockUsers });
    });

    it('should handle error when fetching all users fails', async () => {
      const error = new Error('Database error');
      (userService.getAllUsers as jest.Mock).mockRejectedValue(error);

      await userController.getAllUsers(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('updateUserType', () => {
    it('should update user type successfully', async () => {
      mockRequest.params = { userId: '123' };
      mockRequest.body = { userType: 'ADMIN' };
      
      const updatedUser = { id: '123', userType: 'ADMIN' };
      (userService.updateUserType as jest.Mock).mockResolvedValue(updatedUser);

      await userController.updateUserType(mockRequest as Request, mockResponse as Response, mockNext);

      expect(userService.updateUserType).toHaveBeenCalledWith('123', 'ADMIN');
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User type updated successfully', user: updatedUser });
    });

    it('should handle invalid user type', async () => {
      mockRequest.params = { userId: '123' };
      mockRequest.body = { userType: 'INVALID_TYPE' };

      await userController.updateUserType(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(CustomError));
      expect(mockNext.mock.calls[0][0].message).toBe('Invalid user type');
      expect(mockNext.mock.calls[0][0].statusCode).toBe(400);
    });
  });
});