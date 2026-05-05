import { Client } from 'pg';

/**
 * Creates a fresh pg Client, runs your callback, then closes the connection.
 * This is the correct pattern for serverless — no persistent pool.
 */
export async function dbQuery(
  sql: string,
  params: unknown[] = []
): Promise<Record<string, unknown>[]> {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL is not set. Add it to Vercel → Settings → Environment Variables.'
    );
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10_000,
    query_timeout: 15_000,
  });

  await client.connect();
  try {
    const result = await client.query(sql, params);
    return result.rows;
  } finally {
    await client.end().catch(() => {});  // always close
  }
}
