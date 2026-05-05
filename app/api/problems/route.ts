import { NextRequest } from 'next/server';
import { getPool } from '../../lib/db';
import { Problem } from '../../lib/types';

// GET /api/problems — fetch all, newest first
export async function GET() {
  try {
    const pool = getPool();
    const { rows } = await pool.query(
      `SELECT data FROM problems ORDER BY (data->>'submittedAt') DESC NULLS LAST`
    );
    return Response.json(rows.map((r) => r.data as Problem));
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[GET /api/problems]', msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}

// POST /api/problems — create a new problem
export async function POST(req: NextRequest) {
  try {
    const pool = getPool();
    const problem = (await req.json()) as Problem;

    if (!problem.id) {
      return Response.json({ error: 'Problem must have an id' }, { status: 400 });
    }

    await pool.query(
      `INSERT INTO problems (id, data)
       VALUES ($1, $2)
       ON CONFLICT (id) DO UPDATE SET data = $2, updated_at = NOW()`,
      [problem.id, JSON.stringify(problem)]
    );

    return Response.json(problem, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[POST /api/problems]', msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}
