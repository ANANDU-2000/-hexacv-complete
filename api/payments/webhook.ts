import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getOrderByTxnid, setOrderVerified, addUnlock } from '../lib/store.js';
import { verifyResponseHash, isPayuConfigured } from '../lib/payu.js';
import { getPaymentsCollection } from '../lib/mongo.js';

const PAYU_KEY = process.env.PAYU_KEY || '';

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
    // PayU may send form-urlencoded or JSON
    const data = typeof req.body === 'object' && req.body !== null
      ? req.body
      : {};

    const txnid = (data.txnid ?? data.mihpayid ?? '').toString().trim();
    const amount = (data.amount ?? '').toString().trim();
    const productinfo = (data.productinfo ?? '').toString();
    const firstname = (data.firstname ?? '').toString();
    const email = (data.email ?? '').toString();
    const status = (data.status ?? '').toString();
    const hash = (data.hash ?? '').toString();
    const udf1 = (data.udf1 ?? '').toString();
    const udf2 = (data.udf2 ?? '').toString();

    if (!txnid || !hash) {
      return res.status(400).json({ error: 'Missing txnid or hash' });
    }

    const valid = verifyResponseHash({
      key: PAYU_KEY,
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      status,
      udf1,
      udf2,
      receivedHash: hash,
    });

    if (!valid) {
      return res.status(400).json({ error: 'Invalid hash' });
    }

    if (status.toLowerCase() !== 'success') {
      return res.status(200).json({ received: true, message: 'Payment not successful' });
    }

    // Session/template from PayU callback (we always send udf1=sessionId, udf2=templateId)
    const sessionId = udf1 || '';
    const templateId = udf2 || '';

    // Idempotent: already processed? Check in-memory first, then MongoDB
    const order = getOrderByTxnid(txnid);
    if (order?.status === 'verified') {
      return res.status(200).json({ received: true, message: 'Already processed' });
    }
    let alreadyPaidInDb = false;
    try {
      const payments = await getPaymentsCollection();
      const doc = await payments.findOne({ gateway_order_id: txnid });
      alreadyPaidInDb = doc?.status === 'PAID';
    } catch (_) {}
    if (alreadyPaidInDb) {
      return res.status(200).json({ received: true, message: 'Already processed' });
    }

    if (!sessionId || !templateId) {
      return res.status(400).json({ error: 'Missing session or template in callback' });
    }

    setOrderVerified(txnid);
    addUnlock(sessionId, templateId, txnid);

    // Persist payment row to MongoDB for admin + unlock checks
    try {
      const payments = await getPaymentsCollection();
      const now = new Date();
      await payments.updateOne(
        { gateway_order_id: txnid },
        {
          $set: {
            session_id: sessionId,
            gateway_order_id: txnid,
            receipt_id: txnid,
            amount_paise: Math.round(Number(amount) * 100),
            status: 'PAID',
            email: email || null,
            paid_at: now,
          },
        },
        { upsert: true },
      );
    } catch (dbErr) {
      console.error('Failed to write payment row to MongoDB', dbErr);
    }

    return res.status(200).json({ received: true, unlocked: true });
  } catch (e: unknown) {
    console.error('Webhook error:', e);
    return res.status(500).json({ error: 'Webhook failed' });
  }
}
