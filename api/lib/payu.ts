/**
 * PayU India: hash generation for payment request and hash verification for webhook.
 * Server-side only. Never expose key/salt to frontend.
 */

import { createHash } from 'crypto';

const PAYU_KEY = process.env.PAYU_KEY || '';
const PAYU_SALT = process.env.PAYU_SALT || '';

/**
 * Generate hash for PayU payment request (redirect to PayU).
 * Amount must be in RUPEES as per PayU docs.
 * Formula: sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||salt)
 */
export function generateRequestHash(params: {
  txnid: string;
  amount: number; // in rupees
  productinfo: string;
  firstname: string;
  email: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
}): string {
  const u1 = params.udf1 || '';
  const u2 = params.udf2 || '';
  const u3 = params.udf3 || '';
  const u4 = params.udf4 || '';
  const u5 = params.udf5 || '';
  const str = `${PAYU_KEY}|${params.txnid}|${params.amount}|${params.productinfo}|${params.firstname}|${params.email}|${u1}|${u2}|${u3}|${u4}|${u5}||||||${PAYU_SALT}`;
  return createHash('sha512').update(str).digest('hex');
}

/**
 * Verify PayU webhook/callback response hash.
 * Amount must be in RUPEES (same as sent in request).
 * Formula: sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5|status||||||salt)
 */
export function verifyResponseHash(params: {
  key: string;
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  status: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
  receivedHash: string;
}): boolean {
  const u1 = params.udf1 || '';
  const u2 = params.udf2 || '';
  const u3 = params.udf3 || '';
  const u4 = params.udf4 || '';
  const u5 = params.udf5 || '';
  const str = `${params.key}|${params.txnid}|${params.amount}|${params.productinfo}|${params.firstname}|${params.email}|${u1}|${u2}|${u3}|${u4}|${u5}|${params.status}||||||${PAYU_SALT}`;
  const hash = createHash('sha512').update(str).digest('hex');
  return hash === params.receivedHash;
}

export function isPayuConfigured(): boolean {
  return Boolean(PAYU_KEY && PAYU_SALT);
}
