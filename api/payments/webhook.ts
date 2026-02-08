import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getOrderByTxnid, setOrderVerified, addUnlock } from '../lib/store';
import { verifyResponseHash, isPayuConfigured } from '../lib/payu';

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

    const order = getOrderByTxnid(txnid);
    if (!order) {
      return res.status(400).json({ error: 'Order not found' });
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

    // Idempotent: already verified then just ack
    if (order.status === 'verified') {
      return res.status(200).json({ received: true, message: 'Already processed' });
    }

    setOrderVerified(txnid);
    const sessionId = udf1 || order.sessionId;
    const templateId = udf2 || order.templateId;
    addUnlock(sessionId, templateId, txnid);

    return res.status(200).json({ received: true, unlocked: true });
  } catch (e: unknown) {
    console.error('Webhook error:', e);
    return res.status(500).json({ error: 'Webhook failed' });
  }
}
