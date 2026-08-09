export interface CreateOrderParams {
  amount: number; // In smaller unit (e.g., paise)
  currency: string;
  receipt: string;
}

export interface PaymentOrder {
  id: string; // The provider's order ID (e.g., rzp_order_123)
  amount: number;
  currency: string;
}

export interface VerifyPaymentParams {
  orderId: string; // Provider order ID
  paymentId: string; // Provider payment ID
  signature: string; // Verification signature
}

export interface RefundParams {
  paymentId: string;
  amount?: number; // Optional, full refund if not provided
}

export interface PaymentProvider {
  createOrder(params: CreateOrderParams): Promise<PaymentOrder>;
  verifyPayment(params: VerifyPaymentParams): Promise<boolean>;
  refund(params: RefundParams): Promise<boolean>;
}
