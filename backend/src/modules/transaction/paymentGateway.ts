// Mock PaymentGateway
export interface PaymentGatewayResponse {
  success: boolean;
  transactionId: string;
  message: string;
  status?: 'PENDING' | 'COMPLETED' | 'FAILED';
}

// Mock PaymentGateway call
export const processPayment = async (amount: number, currency: string): Promise<PaymentGatewayResponse> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Check for specific amounts and return appropriate responses
  if (amount === 3.14) {
    return {
      success: false,
      transactionId: `PG-${Date.now()}`,
      message: 'Payment failed due to insufficient funds',
      status: 'FAILED',
    };
  } else if (amount === 2.71) {
    return {
      success: false,
      transactionId: `PG-${Date.now()}`,
      message: 'Payment is pending',
      status: 'PENDING',
    };
  }

  // Always return success for this mock implementation
  return {
    success: true,
    transactionId: `PG-${Date.now()}`,
    message: 'Payment processed successfully'
  };
};