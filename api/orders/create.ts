import type { VercelRequest, VercelResponse } from '@vercel/node';
import { insertOrder } from '../lib/store.js';
import { generateRequestHash, isPayuConfigured } from '../lib/payu.js';
import { getPaymentsCollection } from '../lib/mongo.js';

const PAYU_KEY = process.env.PAYU_KEY || '';
const PAYU_SALT = process.env.PAYU_SALT || '';

// PayU test URL (use https://secure.payu.in/_payment for production)
const PAYU_PAYMENT_URL = process.env.PAYU_PAYMENT_URL || 'https://test.payu.in/_payment';

const DEFAULT_AMOUNT_RUPEES = 49; // ₹49 — do not send paise; PayU expects rupees

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
    // PayU expects amount in RUPEES. If frontend accidentally sends paise (e.g. 4900), treat as ₹49.
    let amountRupees = Number(body.amount);
    if (!Number.isFinite(amountRupees) || amountRupees <= 0) amountRupees = DEFAULT_AMOUNT_RUPEES;
    if (amountRupees > 1000) amountRupees = Math.round(amountRupees / 100); // likely paise
    const amountPaise = Math.round(amountRupees * 100);

    if (!sessionId || !templateId || !email || !email.includes('@')) {
      return res.status(400).json({ error: 'Missing or invalid: sessionId, templateId, email' });
    }

    const txnid = `TXN${Date.now()}`;
    const productinfo = `HexaCV Template: ${templateId}`;
    const firstname = email.split('@')[0].slice(0, 50) || 'User';

    const hash = generateRequestHash({
      txnid,
      amount: amountRupees,
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
      amount: amountRupees,
      amountPaise,
      email,
      phone,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });

    // Persist pending order to MongoDB so webhook can find it on any serverless instance
    try {
      const payments = await getPaymentsCollection();
      await payments.updateOne(
        { gateway_order_id: txnid },
        {
          $set: {
            session_id: sessionId,
            gateway_order_id: txnid,
            receipt_id: txnid,
            amount_paise: amountPaise,
            status: 'PENDING',
            email: email || null,
            created_at: new Date(),
          },
        },
        { upsert: true },
      );
    } catch (dbErr) {
      console.error('Failed to persist order to MongoDB (webhook may still work if same instance)', dbErr);
    }

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
        amount: String(amountRupees), // rupees for PayU
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
