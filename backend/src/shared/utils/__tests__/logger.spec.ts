import winston from 'winston';

// Mock winston module
jest.mock('winston', () => ({
  createLogger: jest.fn(() => ({
    log: jest.fn(),
    add: jest.fn(),
  })),
  format: {
    combine: jest.fn(() => 'combineResult'),
    timestamp: jest.fn(() => 'timestampResult'),
    json: jest.fn(() => 'jsonResult'),
  },
  transports: {
    Console: jest.fn(),
    File: jest.fn(),
  },
}));

describe('Logger', () => {
  let logger: any;

  beforeEach(() => {
    jest.clearAllMocks();
    // Re-import the logger to ensure it's created after our mocks are in place
    jest.isolateModules(() => {
      logger = require('../logger').default;
    });
  });

  it('should create a logger with the correct configuration', () => {
    expect(winston.createLogger).toHaveBeenCalledWith({
      level: 'info',
      format: 'combineResult',
      transports: expect.any(Array),
    });
  });

  it('should create file transports with correct filenames', () => {
    expect(winston.transports.File).toHaveBeenCalledTimes(2);
    expect(winston.transports.File).toHaveBeenCalledWith({ filename: 'error.log', level: 'error' });
    expect(winston.transports.File).toHaveBeenCalledWith({ filename: 'combined.log' });
  });

  it('should create console transport', () => {
    expect(winston.transports.Console).toHaveBeenCalledTimes(1);
  });

  it('should use timestamp and JSON format', () => {
    expect(winston.format.timestamp).toHaveBeenCalled();
    expect(winston.format.json).toHaveBeenCalled();
    expect(winston.format.combine).toHaveBeenCalledWith('timestampResult', 'jsonResult');
  });

  it('should export a logger instance', () => {
    expect(logger).toBeDefined();
    expect(logger.log).toBeDefined();
  });
});