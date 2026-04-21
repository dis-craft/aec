import { NextRequest } from 'next/server';

// Reddit exposes a JSON API on public posts with no auth required
// GET https://www.reddit.com/r/<sub>/comments/<id>.json
// We also support the short form: https://redd.it/<id>

function extractRedditId(url: string): { sub: string; id: string } | null {
  try {
    const u = new URL(url.trim());
    const host = u.hostname.replace('www.', '');

    if (host === 'reddit.com' || host === 'old.reddit.com') {
      // /r/<sub>/comments/<id>/...
      const m = u.pathname.match(/\/r\/([^/]+)\/comments\/([a-z0-9]+)/i);
      if (m) return { sub: m[1], id: m[2] };
    }

    if (host === 'redd.it') {
      // redd.it/<id>
      const m = u.pathname.match(/\/([a-z0-9]+)/i);
      if (m) return { sub: '', id: m[1] };
    }

    return null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json() as { url: string };

    if (!url?.trim()) {
      return Response.json({ error: 'No URL provided' }, { status: 400 });
    }

    const parsed = extractRedditId(url);
    if (!parsed) {
      return Response.json({
        error: 'Could not parse Reddit URL. Make sure it looks like: https://reddit.com/r/subreddit/comments/abc123/...',
      }, { status: 400 });
    }

    // Reddit JSON API — public posts, no auth
    const jsonUrl = parsed.sub
      ? `https://www.reddit.com/r/${parsed.sub}/comments/${parsed.id}.json`
      : `https://www.reddit.com/${parsed.id}.json`;

    const r = await fetch(jsonUrl, {
      headers: {
        // Reddit requires a non-default User-Agent
        'User-Agent': 'ProblemX-Scraper/1.0 (educational project)',
      },
      signal: AbortSignal.timeout(10_000),
    });

    if (!r.ok) {
      return Response.json(
        { error: `Reddit returned HTTP ${r.status}. The post may be private, deleted, or age-restricted.` },
        { status: 502 }
      );
    }

    const data = await r.json() as unknown[][];

    // Reddit JSON structure: [postListing, commentsListing]
    const postData = (data?.[0] as { data?: { children?: { data?: unknown }[] } })
      ?.data?.children?.[0]?.data as Record<string, unknown> | undefined;

    if (!postData) {
      return Response.json({ error: 'Could not parse Reddit response.' }, { status: 422 });
    }

    // Top comments (for context)
    const commentsRaw = (data?.[1] as { data?: { children?: { data?: unknown }[] } })
      ?.data?.children ?? [];
    const topComments = commentsRaw
      .map((c: unknown) => {
        const cm = (c as { data?: Record<string, unknown> })?.data;
        return typeof cm?.body === 'string' ? cm.body.slice(0, 300) : null;
      })
      .filter(Boolean)
      .slice(0, 5)
      .join('\n\n---\n\n');

    const selftext = String(postData.selftext || '').slice(0, 2000);

    return Response.json({
      title: String(postData.title || ''),
      content: selftext || '[Link post — no body text]',
      subreddit: String(postData.subreddit || ''),
      author: String(postData.author || ''),
      score: Number(postData.score ?? 0),
      num_comments: Number(postData.num_comments ?? 0),
      url: String(postData.url || url),
      permalink: `https://reddit.com${postData.permalink || ''}`,
      top_comments: topComments,
      created_utc: Number(postData.created_utc ?? 0),
    });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('AbortError') || msg.includes('timeout')) {
      return Response.json({ error: 'Request timed out — Reddit may be slow or unreachable.' }, { status: 504 });
    }
    return Response.json({ error: 'Internal error', details: msg }, { status: 500 });
  }
}
