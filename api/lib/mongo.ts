/**
 * MongoDB connection for payments, feedback, and admin data.
 * Uses MONGODB_URI or DATABASE_URL from environment. Do not hardcode connection strings.
 */

import { MongoClient, Db, Collection } from 'mongodb';

const uri = process.env.MONGODB_URI || process.env.DATABASE_URL || '';
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export interface PaymentDoc {
  session_id: string;
  gateway_order_id: string;
  receipt_id: string;
  amount_paise: number;
  status: 'PENDING' | 'PAID';
  email: string | null;
  created_at: Date;
  paid_at?: Date | null;
}

export interface FeedbackDoc {
  session_id?: string | null;
  page?: string | null;
  message: string;
  email?: string | null;
  type?: string | null;
  status?: string | null;
  created_at: Date;
}

export async function getDb(): Promise<Db> {
  if (!uri) {
    throw new Error('MONGODB_URI or DATABASE_URL is not configured');
  }
  if (cachedDb) {
    return cachedDb;
  }
  const client = new MongoClient(uri);
  cachedClient = client;
  await client.connect();
  cachedDb = client.db();
  return cachedDb;
}

/** Returns payments collection, or null if MONGODB_URI/DATABASE_URL is not set (order create still returns 200; webhook may not find order on another instance). */
export async function getPaymentsCollectionIfConfigured(): Promise<Collection<PaymentDoc> | null> {
  if (!uri) return null;
  try {
    const db = await getDb();
    const col = db.collection<PaymentDoc>('payments');
    await col.createIndex({ gateway_order_id: 1 }, { unique: true }).catch(() => {});
    await col.createIndex({ session_id: 1 }).catch(() => {});
    await col.createIndex({ created_at: -1 }).catch(() => {});
    return col;
  } catch {
    return null;
  }
}

export async function getPaymentsCollection(): Promise<Collection<PaymentDoc>> {
  if (!uri) throw new Error('MONGODB_URI or DATABASE_URL is not configured');
  const col = await getPaymentsCollectionIfConfigured();
  if (!col) throw new Error('MONGODB_URI or DATABASE_URL is not configured');
  return col;
}

export async function getFeedbackCollection(): Promise<Collection<FeedbackDoc>> {
  const db = await getDb();
  return db.collection<FeedbackDoc>('feedback');
}
