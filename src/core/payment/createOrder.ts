/**
 * Payment: create order via backend API and redirect to PayU.
 * No PayU keys or hash in frontend. Unlock only after webhook verification.
 */

export interface PaymentResult {
  success: boolean;
  message?: string;
  paymentId?: string;
}

const API_BASE = typeof window !== 'undefined' ? '' : '';

/**
 * Create order via POST /api/orders/create, then redirect user to PayU payment page.
 * After payment, PayU redirects to success/failure URL; unlock happens only via webhook.
 */
export async function createOrderAndPay(
  sessionId: string,
  templateId: string,
  amount: number = 4900, // paise, default ₹49
  email: string,
  phone?: string
): Promise<PaymentResult> {
  try {
    const res = await fetch(`${API_BASE}/api/orders/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        templateId,
        email,
        phone: phone || '',
        amount: amount,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        success: false,
        message: data.error || 'Payment not available',
      };
    }

    if (!data.success || !data.paymentUrl || !data.params) {
      return {
        success: false,
        message: data.error || 'Invalid response from server',
      };
    }

    // Submit form to PayU (full-page redirect)
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = data.paymentUrl;
    form.style.display = 'none';

    const params = data.params as Record<string, string>;
    for (const [key, value] of Object.entries(params)) {
      if (value == null) continue;
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = String(value);
      form.appendChild(input);
    }

    document.body.appendChild(form);
    form.submit();

    return { success: true, message: 'Redirecting to payment...' };
  } catch (e: unknown) {
    const isNetworkError =
      e instanceof TypeError &&
      (e.message === 'Failed to fetch' || e.message.includes('NetworkError'));
    const message = isNetworkError
      ? 'Connection failed. For local testing run: npm run dev:full'
      : e instanceof Error ? e.message : 'Payment failed';
    return { success: false, message };
  }
}
