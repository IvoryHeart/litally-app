import { isAdmin } from '../userUtils';
import User from '../../../modules/user/user.model';

jest.mock('../../../modules/user/user.model');

describe('User Utilities', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('isAdmin', () => {
    it('should return true for admin users', async () => {
      const mockUser = { userType: 'ADMIN' };
      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      const result = await isAdmin('adminUserId');

      expect(result).toBe(true);
      expect(User.findById).toHaveBeenCalledWith('adminUserId');
    });

    it('should return false for non-admin users', async () => {
      const mockUser = { userType: 'USER' };
      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      const result = await isAdmin('regularUserId');

      expect(result).toBe(false);
      expect(User.findById).toHaveBeenCalledWith('regularUserId');
    });

    it('should return false if user is not found', async () => {
      (User.findById as jest.Mock).mockResolvedValue(null);

      const result = await isAdmin('nonExistentUserId');

      expect(result).toBe(false);
      expect(User.findById).toHaveBeenCalledWith('nonExistentUserId');
    });
  });
});