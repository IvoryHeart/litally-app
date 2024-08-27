import { processPayment } from '../paymentGateway';

describe('Payment Gateway', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should process a successful payment', async () => {
    const result = processPayment(100, 'USD');
    jest.advanceTimersByTime(1000);
    const response = await result;

    expect(response.success).toBe(true);
    expect(response.transactionId).toMatch(/^PG-\d+$/);
    expect(response.message).toBe('Payment processed successfully');
  });

  it('should handle insufficient funds', async () => {
    const result = processPayment(3.14, 'USD');
    jest.advanceTimersByTime(1000);
    const response = await result;

    expect(response.success).toBe(false);
    expect(response.transactionId).toMatch(/^PG-\d+$/);
    expect(response.message).toBe('Payment failed due to insufficient funds');
    expect(response.status).toBe('FAILED');
  });

  it('should handle pending payment', async () => {
    const result = processPayment(2.71, 'USD');
    jest.advanceTimersByTime(1000);
    const response = await result;

    expect(response.success).toBe(false);
    expect(response.transactionId).toMatch(/^PG-\d+$/);
    expect(response.message).toBe('Payment is pending');
    expect(response.status).toBe('PENDING');
  });

  it('should process payments with different currencies', async () => {
    const result = processPayment(100, 'EUR');
    jest.advanceTimersByTime(1000);
    const response = await result;

    expect(response.success).toBe(true);
    expect(response.transactionId).toMatch(/^PG-\d+$/);
    expect(response.message).toBe('Payment processed successfully');
  });
});