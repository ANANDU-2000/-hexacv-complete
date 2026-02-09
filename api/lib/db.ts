import { Pool } from 'pg';

let pool: Pool | null = null;

export function getDbPool(): Pool {
  if (pool) return pool;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not configured');
  }

  pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: true }
      : undefined,
  });

  return pool;
}

export async function query<T = any>(text: string, params: any[] = []): Promise<{ rows: T[] }> {
  const client = getDbPool();
  return client.query(text, params);
}

