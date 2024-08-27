import User, { IUser } from '../user.model';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

describe('User Model', () => {
  it('should create a new user successfully', async () => {
    const userData = {
      email: 'test@example.com',
      passwordHash: await bcrypt.hash('password123', 10),
      firstName: 'Test',
      lastName: 'User',
    };

    const user = new User(userData);
    await user.save();

    expect(user._id).toBeDefined();
    expect(user.email).toBe(userData.email);
    expect(user.firstName).toBe(userData.firstName);
    expect(user.lastName).toBe(userData.lastName);
    expect(user.userType).toBe('CUSTOMER');
    expect(user.createdAt).toBeDefined();
    expect(user.updatedAt).toBeDefined();
  });

  it('should fail to create a user with invalid data', async () => {
    const invalidUser = new User({
      email: 'invalid-email',
      passwordHash: '',
      firstName: '',
      lastName: '',
    });

    await expect(invalidUser.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('should compare password correctly', async () => {
    const password = 'testpassword';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new User({
      email: 'test@example.com',
      passwordHash,
      firstName: 'Test',
      lastName: 'User',
    });

    await user.save();

    const isMatch = await user.comparePassword(password);
    expect(isMatch).toBe(true);

    const isNotMatch = await user.comparePassword('wrongpassword');
    expect(isNotMatch).toBe(false);
  });
});