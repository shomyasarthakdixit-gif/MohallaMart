import { CreateOrderParams, PaymentOrder, PaymentProvider, RefundParams, VerifyPaymentParams } from "./payment.provider";

export class MockPaymentProvider implements PaymentProvider {
  async createOrder(params: CreateOrderParams): Promise<PaymentOrder> {
    const mockOrderId = `mock_order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    console.log(`[MockPaymentProvider] Creating order: ${mockOrderId} for amount: ${params.amount}`);
    
    return {
      id: mockOrderId,
      amount: params.amount,
      currency: params.currency
    };
  }

  async verifyPayment(params: VerifyPaymentParams): Promise<boolean> {
    console.log(`[MockPaymentProvider] Verifying payment for order: ${params.orderId}`);
    // In mock mode, if signature is 'mock_success', we consider it successful
    // Or we just always return true for simplicity in testing
    return params.signature === "mock_success" || params.signature.startsWith("mock_");
  }

  async refund(params: RefundParams): Promise<boolean> {
    console.log(`[MockPaymentProvider] Processing refund for payment: ${params.paymentId}, amount: ${params.amount}`);
    return true;
  }
}
