import { dbQuery } from '../../lib/db';
import { SAMPLE_PROBLEMS } from '../../lib/sampleData';

export async function POST() {
  try {
    await dbQuery(`
      CREATE TABLE IF NOT EXISTS problems (
        id          TEXT PRIMARY KEY,
        data        JSONB NOT NULL,
        created_at  TIMESTAMPTZ DEFAULT NOW(),
        updated_at  TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    const rows = await dbQuery('SELECT COUNT(*) AS cnt FROM problems');
    const count = parseInt(String(rows[0]?.cnt ?? '0'));

    if (count === 0) {
      for (const p of SAMPLE_PROBLEMS) {
        await dbQuery(
          'INSERT INTO problems (id, data) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING',
          [p.id, JSON.stringify(p)]
        );
      }
    }

    return Response.json({ ok: true, seeded: count === 0 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[/api/init]', msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}
