import { NextRequest } from 'next/server';
import { getPool } from '../../../lib/db';
import { Problem } from '../../../lib/types';

type Ctx = { params: Promise<{ id: string }> };

// PATCH /api/problems/[id] — partial update (merges into existing data)
export async function PATCH(req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const pool = getPool();
    const updates = await req.json();

    const { rows } = await pool.query(
      'SELECT data FROM problems WHERE id = $1',
      [id]
    );
    if (rows.length === 0) {
      return Response.json({ error: 'Not found' }, { status: 404 });
    }

    const merged: Problem = { ...(rows[0].data as Problem), ...updates };

    await pool.query(
      'UPDATE problems SET data = $1, updated_at = NOW() WHERE id = $2',
      [JSON.stringify(merged), id]
    );

    return Response.json(merged);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[PATCH /api/problems/[id]]', msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}

// DELETE /api/problems/[id]
export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const pool = getPool();
    await pool.query('DELETE FROM problems WHERE id = $1', [id]);
    return Response.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[DELETE /api/problems/[id]]', msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}
