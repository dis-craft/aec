import { NextRequest } from 'next/server';
import { dbQuery } from '../../lib/db';
import { Problem } from '../../lib/types';

export async function GET() {
  try {
    const rows = await dbQuery(
      `SELECT data FROM problems ORDER BY (data->>'submittedAt') DESC NULLS LAST`
    );
    return Response.json(rows.map((r) => r.data as Problem));
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[GET /api/problems]', msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const problem = (await req.json()) as Problem;
    if (!problem.id) {
      return Response.json({ error: 'Problem must have an id' }, { status: 400 });
    }
    await dbQuery(
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
