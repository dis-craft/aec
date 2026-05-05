import { NextRequest } from 'next/server';
import { dbQuery } from '../../../lib/db';
import { Problem } from '../../../lib/types';

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const updates = await req.json();

    const rows = await dbQuery('SELECT data FROM problems WHERE id = $1', [id]);
    if (rows.length === 0) {
      return Response.json({ error: 'Not found' }, { status: 404 });
    }

    const merged: Problem = { ...(rows[0].data as Problem), ...updates };
    await dbQuery(
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

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    await dbQuery('DELETE FROM problems WHERE id = $1', [id]);
    return Response.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[DELETE /api/problems/[id]]', msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}
