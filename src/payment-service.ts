// Razorpay Payment Service

import { createOrder, verifyPayment, trackEvent } from './api-service';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface PaymentResult {
  success: boolean;
  templateId?: string;
  message: string;
}

export const initiatePayment = async (
  templateId: string,
  templateName: string,
  userEmail?: string,
  userPhone?: string
): Promise<PaymentResult> => {
  try {
    // Check if Razorpay is loaded
    if (!window.Razorpay) {
      // Load Razorpay script dynamically if not present
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
        document.head.appendChild(script);
      });
    }

    // Create order on backend
    const orderData = await createOrder(templateId);

    // Track payment initiation
    trackEvent('payment_initiated', templateId, undefined, {
      orderId: orderData.orderId,
      amount: orderData.amount
    });

    // Return promise that resolves when payment completes
    return new Promise((resolve, reject) => {
      const options = {
        key: orderData.razorpayKeyId,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.orderId,
        name: 'BuildMyResume',
        description: `Unlock ${templateName} Template`,
        prefill: {
          email: userEmail || '',
          contact: userPhone || '',
        },
        theme: {
          color: '#000000',
        },
        handler: async (response: RazorpayResponse) => {
          try {
            // Verify payment on backend
            const verificationResult = await verifyPayment(
              response.razorpay_payment_id,
              response.razorpay_order_id,
              response.razorpay_signature
            );

            if (verificationResult.success) {
              // Track successful payment
              trackEvent('payment_success', templateId, undefined, {
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id
              });

              resolve({
                success: true,
                templateId: verificationResult.templateId,
                message: verificationResult.message
              });
            } else {
              // Track failed verification
              trackEvent('payment_failed', templateId, undefined, {
                orderId: response.razorpay_order_id,
                reason: verificationResult.error
              });

              reject(new Error(verificationResult.message));
            }
          } catch (error) {
            reject(error);
          }
        },
        modal: {
          ondismiss: () => {
            reject(new Error('Payment cancelled by user'));
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    });
  } catch (error: any) {
    console.error('Payment initiation error:', error);
    
    // Provide user-friendly error messages
    if (error.message?.includes('Failed to create order') || error.message?.includes('Server error')) {
      throw new Error('Unable to connect to payment server. Please check your internet connection and try again.');
    }
    if (error.message?.includes('Razorpay')) {
      throw new Error('Payment gateway failed to load. Please refresh the page and try again.');
    }
    
    throw new Error(error.message || 'Payment initialization failed. Please try again.');
  }
};
