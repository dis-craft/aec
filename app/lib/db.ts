import { Pool } from 'pg';

// Singleton pool — reused across hot-reloads in dev and across requests in prod
declare global {
  // eslint-disable-next-line no-var
  var _pgPool: Pool | undefined;
}

function createPool(): Pool {
  return new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });
}

export function getPool(): Pool {
  if (!global._pgPool) {
    global._pgPool = createPool();
  }
  return global._pgPool;
}
