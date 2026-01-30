// Payment & Order Types
export interface Order {
  id: number;
  razorpayOrderId: string;
  sessionId: string;
  templateId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'verified' | 'failed';
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  createdAt: Date;
  verifiedAt?: Date;
}

export interface CreateOrderRequest {
  templateId: string;
  sessionId: string;
}

export interface CreateOrderResponse {
  orderId: string;
  razorpayKeyId: string;
  amount: number;
  currency: string;
  templateName: string;
}

export interface VerifyPaymentRequest {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  sessionId: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  templateId?: string;
  message: string;
  error?: string;
}
