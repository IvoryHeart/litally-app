import mongoose from 'mongoose';
import connectDB from '../database';
import logger from '../../shared/utils/logger';

jest.mock('mongoose');
jest.mock('../../shared/utils/logger');

describe('Database Connection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should connect to the database successfully', async () => {
    const mockConnect = mongoose.connect as jest.Mock;
    mockConnect.mockResolvedValue({
      connection: {
        host: 'localhost',
      },
    });

    await connectDB();

    expect(mockConnect).toHaveBeenCalledWith(process.env.MONGODB_URI);
    expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('MongoDB Connected:'));
  });

  it('should exit process on connection error', async () => {
    const mockConnect = mongoose.connect as jest.Mock;
    mockConnect.mockRejectedValue(new Error('Connection failed'));

    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });

    await expect(connectDB()).rejects.toThrow('process.exit called');

    expect(mockExit).toHaveBeenCalledWith(1);
    expect(logger.error).toHaveBeenCalledWith('Error connecting to MongoDB:', expect.any(Error));

    mockExit.mockRestore();
  });
});