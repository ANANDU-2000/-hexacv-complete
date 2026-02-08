import type { VercelRequest, VercelResponse } from '@vercel/node';
import { insertOrder } from '../lib/store';
import { generateRequestHash, isPayuConfigured } from '../lib/payu';

const PAYU_KEY = process.env.PAYU_KEY || '';
const PAYU_SALT = process.env.PAYU_SALT || '';

// PayU test URL (use https://secure.payu.in/_payment for production)
const PAYU_PAYMENT_URL = process.env.PAYU_PAYMENT_URL || 'https://test.payu.in/_payment';

const DEFAULT_AMOUNT_PAISE = 4900; // ₹49

function setCors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!isPayuConfigured()) {
    return res.status(503).json({ error: 'Payment not configured' });
  }

  try {
    const body = req.body as { sessionId?: string; templateId?: string; email?: string; phone?: string; amount?: number };
    const sessionId = body.sessionId?.trim();
    const templateId = body.templateId?.trim();
    const email = body.email?.trim();
    const phone = body.phone?.trim() || '';
    const amountPaise = Number(body.amount) || DEFAULT_AMOUNT_PAISE;

    if (!sessionId || !templateId || !email || !email.includes('@')) {
      return res.status(400).json({ error: 'Missing or invalid: sessionId, templateId, email' });
    }

    const txnid = `TXN${Date.now()}`;
    const productinfo = `HexaCV Template: ${templateId}`;
    const firstname = email.split('@')[0].slice(0, 50) || 'User';

    const hash = generateRequestHash({
      txnid,
      amount: amountPaise,
      productinfo,
      firstname,
      email,
      udf1: sessionId,
      udf2: templateId,
    });

    insertOrder({
      txnid,
      sessionId,
      templateId,
      amount: amountPaise / 100,
      amountPaise,
      email,
      phone,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });

    // Build redirect URL for frontend: frontend will POST form to PayU or we return URL + params for client to submit
    const successUrl = typeof process.env.PAYU_SUCCESS_URL === 'string'
      ? process.env.PAYU_SUCCESS_URL
      : `${req.headers.origin || ''}/preview?payment=success`;
    const failureUrl = typeof process.env.PAYU_FAILURE_URL === 'string'
      ? process.env.PAYU_FAILURE_URL
      : `${req.headers.origin || ''}/preview?payment=failure`;

    return res.status(200).json({
      success: true,
      txnid,
      paymentUrl: PAYU_PAYMENT_URL,
      params: {
        key: PAYU_KEY,
        txnid,
        amount: String(amountPaise),
        productinfo,
        firstname,
        email,
        phone,
        udf1: sessionId,
        udf2: templateId,
        hash,
        surl: successUrl,
        furl: failureUrl,
        service_provider: 'payu_paisa',
      },
    });
  } catch (e: unknown) {
    console.error('Create order error:', e);
    return res.status(500).json({ error: 'Failed to create order' });
  }
}
