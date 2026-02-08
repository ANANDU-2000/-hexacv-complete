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
    return res.status(503).json({ error: 'Payment not configured. Add PAYU_KEY and PAYU_SALT in Vercel Environment Variables.' });
  }

  try {
    // Vercel may leave body undefined or parse it; ensure we have an object
    const rawBody = req.body;
    const body =
      rawBody && typeof rawBody === 'object' && !Array.isArray(rawBody)
        ? rawBody as Record<string, unknown>
        : typeof rawBody === 'string'
          ? (() => { try { return JSON.parse(rawBody) as Record<string, unknown>; } catch { return {}; } })()
          : {};

    const sessionId = typeof body.sessionId === 'string' ? body.sessionId.trim() : '';
    const templateId = typeof body.templateId === 'string' ? body.templateId.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
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

    const origin = (req.headers.origin || req.headers.referer || '').toString().replace(/\/$/, '');
    const successUrl = typeof process.env.PAYU_SUCCESS_URL === 'string' && process.env.PAYU_SUCCESS_URL
      ? process.env.PAYU_SUCCESS_URL
      : `${origin || 'https://www.hexacv.online'}/preview?payment=success`;
    const failureUrl = typeof process.env.PAYU_FAILURE_URL === 'string' && process.env.PAYU_FAILURE_URL
      ? process.env.PAYU_FAILURE_URL
      : `${origin || 'https://www.hexacv.online'}/preview?payment=failure`;

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
    const err = e instanceof Error ? e : new Error(String(e));
    console.error('Create order error:', err.message, err.stack);
    return res.status(500).json({
      error: 'Failed to create order',
      code: 'ORDER_CREATE_FAILED',
    });
  }
}
