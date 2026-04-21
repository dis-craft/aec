import { NextRequest } from 'next/server';

/* ─── Types ─────────────────────────────────────────────────── */

export interface RedditPost {
  id: string;
  title: string;
  selftext: string;
  subreddit: string;
  author: string;
  score: number;
  num_comments: number;
  url: string;
  permalink: string;
  created_utc: number;
  // Computed by our pipeline
  relevanceScore: number;
  problemKeywords: string[];
  combinedText: string;
}

/* ─── Problem-signal keywords ────────────────────────────────── */

const PROBLEM_SIGNALS = [
  'problem', 'issue', 'struggling', 'struggle', 'how do i', 'how to fix',
  'cannot', "can't", "can not", 'broken', 'failing', 'failed', 'keeps',
  'always', 'never works', 'frustrated', 'annoying', 'waste', 'inefficient',
  'inefficiency', 'slow', 'manual', 'tedious', 'confusing', 'hard to',
  'difficult', 'pain point', 'help', 'why is', 'why does', 'not working',
  'bug', 'error', 'crash', 'delay', 'bottleneck', 'fix', 'improve',
  'solution', 'solve', 'address', 'tackle', 'lacking', 'missing', 'need',
];

const NOISE_SIGNALS = [
  'meme', 'lol', 'haha', 'funny', 'joke', 'shitpost', 'rant', 'vent',
  'just venting', 'daily thread', 'weekly thread', 'megathread', 'ama',
  'unpopular opinion', 'hot take', 'found this', 'pic', 'photo',
];

/* ─── Scoring ────────────────────────────────────────────────── */

function scorePost(title: string, body: string): { score: number; keywords: string[] } {
  const text = `${title} ${body}`.toLowerCase();

  // Noise check — reject immediately
  const hasNoise = NOISE_SIGNALS.some(n => text.includes(n));
  if (hasNoise) return { score: 0, keywords: [] };

  // Count problem signals
  const matched = PROBLEM_SIGNALS.filter(kw => text.includes(kw));
  const keywordScore = Math.min(matched.length * 12, 60); // max 60 from keywords

  // Body length bonus (longer = more context)
  const lengthScore = Math.min(body.trim().length / 50, 20); // max 20

  // Has body text at all
  const bodyBonus = body.trim().length > 30 ? 10 : 0;

  const total = Math.round(Math.min(keywordScore + lengthScore + bodyBonus, 98));
  return { score: total, keywords: matched.slice(0, 5) };
}

/* ─── API handler ────────────────────────────────────────────── */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      query: string;
      limit?: number;
      subreddit?: string;
      minScore?: number;
    };

    const { query, limit = 25, subreddit, minScore = 20 } = body;

    if (!query?.trim()) {
      return Response.json({ error: 'Query is required' }, { status: 400 });
    }

    // Build Reddit search URL
    const params = new URLSearchParams({
      q: query,
      limit: String(Math.min(limit, 50)),
      sort: 'relevance',
      type: 'link',
    });

    const baseUrl = subreddit
      ? `https://www.reddit.com/r/${subreddit}/search.json`
      : 'https://www.reddit.com/search.json';

    const redditUrl = `${baseUrl}?${params.toString()}`;

    const r = await fetch(redditUrl, {
      headers: { 'User-Agent': 'ProblemX-Pipeline/1.0 (educational project)' },
      signal: AbortSignal.timeout(12_000),
    });

    if (!r.ok) {
      return Response.json(
        { error: `Reddit returned HTTP ${r.status}` },
        { status: 502 }
      );
    }

    const data = await r.json() as {
      data?: { children?: { data?: Record<string, unknown> }[] };
    };

    const children = data?.data?.children ?? [];

    const posts: RedditPost[] = children
      .map((child) => {
        const d = child?.data;
        if (!d) return null;

        const title = String(d.title || '');
        const selftext = String(d.selftext || '').slice(0, 1500);

        const { score: relevanceScore, keywords } = scorePost(title, selftext);

        // Filter stickied/mod posts & low-relevance
        if (d.stickied || relevanceScore < minScore) return null;

        const combinedText = [title, selftext].filter(Boolean).join('\n\n');

        return {
          id: String(d.id || ''),
          title,
          selftext,
          subreddit: String(d.subreddit || ''),
          author: String(d.author || ''),
          score: Number(d.score ?? 0),
          num_comments: Number(d.num_comments ?? 0),
          url: String(d.url || ''),
          permalink: `https://reddit.com${d.permalink || ''}`,
          created_utc: Number(d.created_utc ?? 0),
          relevanceScore,
          problemKeywords: keywords,
          combinedText,
        } satisfies RedditPost;
      })
      .filter((p): p is RedditPost => p !== null)
      .sort((a, b) => b.relevanceScore - a.relevanceScore);

    return Response.json({
      posts,
      total: posts.length,
      query,
      subreddit: subreddit || null,
    });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('AbortError') || msg.includes('timeout')) {
      return Response.json({ error: 'Reddit request timed out' }, { status: 504 });
    }
    return Response.json({ error: 'Internal error', details: msg }, { status: 500 });
  }
}
