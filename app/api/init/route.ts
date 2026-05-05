import { getPool } from '../../lib/db';
import { SAMPLE_PROBLEMS } from '../../lib/sampleData';

export async function POST() {
  try {
    const pool = getPool();

    // Create the problems table (JSONB approach — no rigid column schema)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS problems (
        id          TEXT PRIMARY KEY,
        data        JSONB NOT NULL,
        created_at  TIMESTAMPTZ DEFAULT NOW(),
        updated_at  TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Seed with sample data if the table is empty
    const { rows } = await pool.query('SELECT COUNT(*) AS cnt FROM problems');
    if (parseInt(rows[0].cnt) === 0) {
      for (const p of SAMPLE_PROBLEMS) {
        await pool.query(
          'INSERT INTO problems (id, data) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING',
          [p.id, JSON.stringify(p)]
        );
      }
    }

    return Response.json({ ok: true, seeded: parseInt(rows[0].cnt) === 0 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[/api/init] Error:', msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}
