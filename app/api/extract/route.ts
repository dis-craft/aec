import { NextRequest } from 'next/server';

const OLLAMA_BASE = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'phi';

const EXTRACTION_PROMPT = (text: string) => `
You are a structured data extractor for a problem discovery platform.

Extract a real-world problem from the input text below and return ONLY valid JSON — no explanation, no markdown, no extra text.

Return this exact JSON structure:
{
  "title": "concise problem title (max 12 words)",
  "problem_statement": "clear 2-3 sentence description of the problem",
  "short_summary": "one sentence summary starting with 'A [domain] problem:'",
  "who_affected": "who is affected by this problem",
  "cause": "root cause of the problem",
  "impact": "impact if the problem continues",
  "frequency": "how often this occurs (e.g. Daily, Weekly, Seasonal)",
  "domain": "one of: Healthcare, Education, Environment, Transport, Agriculture, Finance, Technology, Civic & Governance, Manufacturing, Retail, Energy, Social Impact, Food & Nutrition, Housing, Safety & Security, Other",
  "tags": ["array", "of", "relevant", "tags", "from: automation, data-driven, software, hardware, process-improvement, iot, ai-ml, mobile, web, analytics, communication, logistics, monitoring, awareness, education, healthcare, environment, campus, industry, ngo, civic-issues, productivity"],
  "difficulty": "one of: easy, medium, hard, research",
  "urgency": "one of: low, medium, high, critical",
  "feasibility": "one of: low, medium, high",
  "required_skills": ["array", "of", "technical", "skills", "needed"],
  "confidence_score": a number between 60 and 98 reflecting how clearly the problem is defined
}

Input text:
${text}
`.trim();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text } = body as { text: string };

    if (!text || text.trim().length < 10) {
      return Response.json({ error: 'Input text is too short' }, { status: 400 });
    }

    // Call Ollama
    const ollamaRes = await fetch(`${OLLAMA_BASE}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: EXTRACTION_PROMPT(text),
        stream: false,
        options: {
          temperature: 0.2,    // low temp = more deterministic JSON
          num_predict: 600,
        },
      }),
      // Timeout after 30s so UI doesn't hang indefinitely
      signal: AbortSignal.timeout(30_000),
    });

    if (!ollamaRes.ok) {
      const errText = await ollamaRes.text();
      console.error('[Ollama] Non-OK response:', errText);
      return Response.json({ error: 'Ollama returned an error', details: errText }, { status: 502 });
    }

    const ollamaData = await ollamaRes.json() as { response: string };
    const rawResponse = ollamaData.response || '';

    // Attempt to parse JSON — Ollama sometimes wraps it in markdown code fences
    let parsed: Record<string, unknown> | null = null;

    // Try direct parse first
    try {
      parsed = JSON.parse(rawResponse.trim());
    } catch {
      // Strip markdown fences and try again
      const fenceMatch = rawResponse.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (fenceMatch) {
        try { parsed = JSON.parse(fenceMatch[1].trim()); } catch { /* still failed */ }
      }
      // Last resort: extract first {...} block
      if (!parsed) {
        const braceMatch = rawResponse.match(/\{[\s\S]*\}/);
        if (braceMatch) {
          try { parsed = JSON.parse(braceMatch[0]); } catch { /* give up */ }
        }
      }
    }

    if (!parsed) {
      // Return the raw text so the client can fall back to keyword extraction
      return Response.json({
        error: 'Could not parse AI output as JSON',
        raw: rawResponse,
        parsed: null,
      }, { status: 422 });
    }

    return Response.json({ parsed, raw: rawResponse });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);

    // Distinguish "Ollama not running" from other errors
    if (message.includes('ECONNREFUSED') || message.includes('fetch failed') || message.includes('AbortError')) {
      return Response.json({
        error: 'Ollama is not running',
        hint: 'Start Ollama with: ollama run phi',
      }, { status: 503 });
    }

    console.error('[extract API] Unexpected error:', message);
    return Response.json({ error: 'Internal server error', details: message }, { status: 500 });
  }
}
