'use client';
import React, { useState } from 'react';
import { useProblems } from '../context/ProblemsContext';
import { useUser } from '../context/UserContext';
import { runAIExtractionWithOllama } from '../lib/aiExtractor';
import { toast } from '../components/ui/Toast';
import { Button } from '../components/ui/Button';
import type { RedditPost } from '../api/reddit/search/route';
import {
  Search, Zap, CheckCircle2, ArrowUpRight, ExternalLink,
  Filter, RefreshCw, AlertTriangle, Loader2, TrendingUp,
} from 'lucide-react';

/* ─── Preset search queries ──────────────────────────────────── */

const PRESET_QUERIES = [
  { label: 'How to fix…', query: 'how do i fix problem', icon: '🔧' },
  { label: 'Struggling with…', query: 'struggling with issue help', icon: '😤' },
  { label: 'Campus / College', query: 'college campus problem struggling students', icon: '🎓' },
  { label: 'Manual & boring work', query: 'manual tedious inefficient work waste time', icon: '😩' },
  { label: 'Healthcare issues', query: 'hospital patients healthcare problem issue', icon: '🏥' },
  { label: 'Traffic & Transport', query: 'traffic transport commute problem', icon: '🚗' },
  { label: 'No solution exists', query: 'why is there no solution for problem', icon: '❓' },
  { label: 'India-specific', query: 'india problem issue struggling fix', icon: '🇮🇳' },
];

/* ─── Pipeline stage display ─────────────────────────────────── */

type Stage = 'idle' | 'fetching' | 'filtering' | 'done' | 'error';

const STAGE_LABELS: Record<Stage, string> = {
  idle: 'Ready',
  fetching: 'Fetching from Reddit…',
  filtering: 'Scoring & filtering posts…',
  done: 'Pipeline complete',
  error: 'Pipeline error',
};

/* ─── Relevance ring ─────────────────────────────────────────── */

function RelevanceRing({ score }: { score: number }) {
  const color = score >= 70 ? '#43e97b' : score >= 45 ? '#f9a825' : '#ff6584';
  const r = 18;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" style={{ flexShrink: 0 }}>
      <circle cx="22" cy="22" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
      <circle cx="22" cy="22" r={r} fill="none" stroke={color} strokeWidth="4"
        strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={-Math.PI / 2 * r}
        transform="rotate(-90 22 22)" strokeLinecap="round" />
      <text x="22" y="26" textAnchor="middle" fill={color} fontSize="10" fontWeight="800">{score}</text>
    </svg>
  );
}

/* ─── Post card ──────────────────────────────────────────────── */

function PostCard({
  post, selected, onToggle, onImport, importing,
}: {
  post: RedditPost;
  selected: boolean;
  onToggle: () => void;
  onImport: () => void;
  importing: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const relevanceColor = post.relevanceScore >= 70 ? '#43e97b' : post.relevanceScore >= 45 ? '#f9a825' : '#ff6584';

  return (
    <div style={{
      background: selected ? 'rgba(108,99,255,0.08)' : '#0e0e1f',
      border: `1px solid ${selected ? 'rgba(108,99,255,0.35)' : 'rgba(255,255,255,0.07)'}`,
      borderRadius: '14px', padding: '18px 20px', transition: 'all 0.2s',
    }}>
      <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
        {/* Checkbox */}
        <input type="checkbox" checked={selected} onChange={onToggle}
          style={{ accentColor: '#6c63ff', width: '16px', height: '16px', marginTop: '4px', flexShrink: 0 }} />

        {/* Relevance ring */}
        <RelevanceRing score={post.relevanceScore} />

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '6px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '5px' }}>
                <span style={{
                  fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px',
                  background: 'rgba(255,101,132,0.12)', color: '#ff6584', border: '1px solid rgba(255,101,132,0.2)',
                }}>r/{post.subreddit}</span>
                <span style={{ fontSize: '0.68rem', color: '#555575' }}>↑ {post.score.toLocaleString()}</span>
                <span style={{ fontSize: '0.68rem', color: '#555575' }}>💬 {post.num_comments}</span>
                {post.problemKeywords.map(kw => (
                  <span key={kw} style={{
                    fontSize: '0.63rem', padding: '1px 6px', borderRadius: '4px',
                    background: `${relevanceColor}12`, color: relevanceColor, border: `1px solid ${relevanceColor}25`,
                  }}>"{kw}"</span>
                ))}
              </div>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#e0e0ff', lineHeight: 1.35 }}>
                {post.title}
              </h3>
            </div>
          </div>

          {/* Body preview */}
          {post.selftext && (
            <div>
              <p style={{ fontSize: '0.78rem', color: '#888899', lineHeight: 1.55, marginBottom: '6px' }}>
                {expanded ? post.selftext : post.selftext.slice(0, 160) + (post.selftext.length > 160 ? '…' : '')}
              </p>
              {post.selftext.length > 160 && (
                <button onClick={() => setExpanded(e => !e)}
                  style={{ background: 'none', border: 'none', color: '#6c63ff', fontSize: '0.73rem', cursor: 'pointer', padding: 0 }}>
                  {expanded ? 'Show less' : 'Read more'}
                </button>
              )}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={onImport}
              disabled={importing}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                padding: '5px 12px', borderRadius: '7px', fontSize: '0.75rem', fontWeight: 700,
                background: importing ? 'rgba(108,99,255,0.18)' : 'rgba(108,99,255,0.15)',
                border: '1px solid rgba(108,99,255,0.3)', color: '#a78bfa',
                cursor: importing ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
              }}
            >
              {importing
                ? <><Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} /> Extracting…</>
                : <><Zap size={11} /> Extract & Import</>}
            </button>
            <a href={post.permalink} target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '5px 10px', borderRadius: '7px', fontSize: '0.73rem', color: '#555575', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', textDecoration: 'none' }}>
              <ExternalLink size={11} /> View on Reddit
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Pipeline step indicator ────────────────────────────────── */

function PipelineBar({ stage, total, imported }: { stage: Stage; total: number; imported: number }) {
  const STEPS = [
    { key: 'fetch', label: 'Fetch', done: stage !== 'idle' && stage !== 'fetching' },
    { key: 'filter', label: 'Filter', done: stage === 'done' || stage === 'error' },
    { key: 'extract', label: 'Extract', done: imported > 0 },
    { key: 'store', label: 'Store', done: imported > 0 },
  ];

  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      background: 'rgba(255,255,255,0.03)', borderRadius: '10px',
      border: '1px solid rgba(255,255,255,0.07)', padding: '10px 16px',
      marginBottom: '20px', flexWrap: 'wrap', gap: '6px',
    }}>
      {STEPS.map((s, i) => (
        <React.Fragment key={s.key}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{
              width: 20, height: 20, borderRadius: '50%', fontSize: '0.62rem', fontWeight: 800,
              background: s.done ? 'rgba(67,233,123,0.2)' : (
                (stage === 'fetching' && i === 0) || (stage === 'filtering' && i === 1)
                  ? 'rgba(249,168,37,0.2)' : 'rgba(255,255,255,0.06)'
              ),
              border: `1px solid ${s.done ? 'rgba(67,233,123,0.4)' : 'rgba(255,255,255,0.1)'}`,
              color: s.done ? '#43e97b' : '#555575',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {s.done ? '✓' : i + 1}
            </div>
            <span style={{ fontSize: '0.75rem', color: s.done ? '#c0c0e0' : '#555575', fontWeight: s.done ? 600 : 400 }}>
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div style={{ flex: 1, minWidth: '20px', height: '1px', background: 'rgba(255,255,255,0.07)' }} />
          )}
        </React.Fragment>
      ))}

      <div style={{ marginLeft: 'auto', fontSize: '0.73rem', color: '#555575' }}>
        {total > 0 && <span style={{ color: '#c0c0e0', fontWeight: 600 }}>{total} posts</span>}
        {imported > 0 && <span style={{ color: '#43e97b', marginLeft: '8px', fontWeight: 700 }}>✓ {imported} imported</span>}
        {stage !== 'idle' && stage !== 'done' && (
          <span style={{ marginLeft: '8px', color: '#f9a825' }}>⏳ {STAGE_LABELS[stage]}</span>
        )}
      </div>
    </div>
  );
}

/* ─── Main page ──────────────────────────────────────────────── */

export default function RedditDiscoveryPage() {
  const { addProblem, problems } = useProblems();
  const { userName } = useUser();

  const [query, setQuery] = useState('');
  const [subreddit, setSubreddit] = useState('');
  const [minRelevance, setMinRelevance] = useState(30);
  const [posts, setPosts] = useState<RedditPost[]>([]);
  const [stage, setStage] = useState<Stage>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [importing, setImporting] = useState<Set<string>>(new Set());
  const [importedCount, setImportedCount] = useState(0);

  async function search() {
    if (!query.trim()) { toast('Enter a search query', 'warning'); return; }
    setStage('fetching');
    setErrorMsg('');
    setPosts([]);
    setSelected(new Set());

    try {
      const res = await fetch('/api/reddit/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, subreddit: subreddit.trim() || undefined, limit: 30, minScore: minRelevance }),
      });
      setStage('filtering');

      // Small delay so the user sees the filtering step
      await new Promise(r => setTimeout(r, 400));

      const data = await res.json() as { posts: RedditPost[]; error?: string };
      if (!res.ok || data.error) {
        setErrorMsg(data.error || `HTTP ${res.status}`);
        setStage('error');
        return;
      }

      setPosts(data.posts);
      setStage('done');
      toast(`Found ${data.posts.length} relevant posts`, 'success');
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Network error');
      setStage('error');
    }
  }

  async function importPost(post: RedditPost) {
    setImporting(s => new Set(s).add(post.id));
    try {
      const rawInput: Record<string, string> = {
        title: post.title,
        description: post.selftext || post.title,
        post_content: post.selftext,
        source_platform: 'Reddit',
        source_url: post.permalink,
        affected: '',
      };

      const { result: extracted, usedOllama } = await runAIExtractionWithOllama(rawInput, 'online', problems);

      const newProblem = {
        ...extracted,
        source: 'online' as const,
        submittedBy: userName,
        rawInput,
        sourceUrl: post.permalink,
        isConfidential: false,
        // Boost confidence based on Reddit upvotes
        confidenceScore: Math.min(98, (extracted.confidenceScore ?? 60) + Math.min(Math.round(post.score / 50), 15)),
      } as Parameters<typeof addProblem>[0];

      addProblem(newProblem);
      setImportedCount(n => n + 1);
      toast(
        usedOllama ? `"${post.title.slice(0, 40)}…" extracted by Ollama ✨` : `"${post.title.slice(0, 40)}…" imported`,
        'success'
      );
    } catch (e) {
      toast(`Import failed: ${e instanceof Error ? e.message : 'Unknown error'}`, 'error');
    } finally {
      setImporting(s => { const n = new Set(s); n.delete(post.id); return n; });
    }
  }

  async function importSelected() {
    const toImport = posts.filter(p => selected.has(p.id));
    for (const post of toImport) {
      await importPost(post);
      // Prevent hammering Ollama
      await new Promise(r => setTimeout(r, 300));
    }
    setSelected(new Set());
  }

  function toggleAll() {
    if (selected.size === posts.length) setSelected(new Set());
    else setSelected(new Set(posts.map(p => p.id)));
  }

  const highRelevance = posts.filter(p => p.relevanceScore >= 70).length;
  const medRelevance = posts.filter(p => p.relevanceScore >= 45 && p.relevanceScore < 70).length;

  return (
    <div className="page">
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <span style={{ fontSize: '1.4rem' }}>🔴</span>
          <h1 className="page-title">Reddit Discovery Pipeline</h1>
        </div>
        <p className="page-subtitle">
          Search Reddit for real-world problems, score relevance, and batch-extract into the archive.
        </p>
      </div>

      {/* Pipeline bar */}
      <PipelineBar stage={stage} total={posts.length} imported={importedCount} />

      {/* Search controls */}
      <div className="card" style={{ padding: '22px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Preset queries */}
          <div>
            <div style={{ fontSize: '0.72rem', color: '#555575', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '8px' }}>
              Quick Queries
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {PRESET_QUERIES.map(p => (
                <button key={p.query} onClick={() => setQuery(p.query)}
                  style={{
                    padding: '5px 12px', borderRadius: '8px', fontSize: '0.76rem', fontWeight: 600,
                    background: query === p.query ? 'rgba(108,99,255,0.2)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${query === p.query ? 'rgba(108,99,255,0.4)' : 'rgba(255,255,255,0.08)'}`,
                    color: query === p.query ? '#a78bfa' : '#888899',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >
                  {p.icon} {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search row */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ flex: 2, minWidth: '240px', position: 'relative' }}>
              <Search size={15} color="#555575" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                className="form-input"
                style={{ paddingLeft: '36px' }}
                placeholder='e.g. "struggling with attendance manual work"'
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && search()}
              />
            </div>
            <div style={{ flex: 1, minWidth: '140px', position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#555575', fontSize: '0.85rem', pointerEvents: 'none' }}>r/</span>
              <input
                className="form-input"
                style={{ paddingLeft: '28px' }}
                placeholder="subreddit (optional)"
                value={subreddit}
                onChange={e => setSubreddit(e.target.value.replace(/^r\//, ''))}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <Filter size={13} color="#555575" />
              <span style={{ fontSize: '0.75rem', color: '#666688', whiteSpace: 'nowrap' }}>Min score</span>
              <select className="form-input form-select" style={{ width: 'auto', padding: '8px 28px 8px 10px', fontSize: '0.8rem' }}
                value={minRelevance} onChange={e => setMinRelevance(Number(e.target.value))}>
                {[10, 20, 30, 40, 50].map(v => <option key={v} value={v}>{v}+</option>)}
              </select>
            </div>
            <Button onClick={search} loading={stage === 'fetching' || stage === 'filtering'} icon={<Search size={15} />}>
              {stage === 'fetching' ? 'Fetching…' : stage === 'filtering' ? 'Scoring…' : 'Search Reddit'}
            </Button>
          </div>
        </div>
      </div>

      {/* Error */}
      {stage === 'error' && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '14px 18px', background: 'rgba(255,101,132,0.08)',
          border: '1px solid rgba(255,101,132,0.2)', borderRadius: '12px', marginBottom: '20px',
        }}>
          <AlertTriangle size={16} color="#ff6584" />
          <span style={{ fontSize: '0.85rem', color: '#ff6584' }}>{errorMsg}</span>
        </div>
      )}

      {/* Results header */}
      {posts.length > 0 && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ fontSize: '0.85rem', color: '#c0c0e0', fontWeight: 700 }}>
                {posts.length} posts found
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(67,233,123,0.12)', color: '#43e97b' }}>
                  🟢 High: {highRelevance}
                </span>
                <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(249,168,37,0.12)', color: '#f9a825' }}>
                  🟡 Medium: {medRelevance}
                </span>
                <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,101,132,0.12)', color: '#ff6584' }}>
                  🔴 Low: {posts.length - highRelevance - medRelevance}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button onClick={toggleAll}
                style={{
                  padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  color: '#888899', cursor: 'pointer',
                }}>
                {selected.size === posts.length ? 'Deselect All' : 'Select All'}
              </button>
              {selected.size > 0 && (
                <Button
                  onClick={importSelected}
                  loading={importing.size > 0}
                  icon={<Zap size={14} />}
                >
                  Import {selected.size} Selected
                </Button>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                selected={selected.has(post.id)}
                onToggle={() => setSelected(s => {
                  const n = new Set(s);
                  n.has(post.id) ? n.delete(post.id) : n.add(post.id);
                  return n;
                })}
                onImport={() => importPost(post)}
                importing={importing.has(post.id)}
              />
            ))}
          </div>
        </>
      )}

      {/* Empty state */}
      {stage === 'done' && posts.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#0e0e1f', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🤔</div>
          <div style={{ color: '#c0c0e0', fontWeight: 600 }}>No relevant posts found</div>
          <div style={{ color: '#555575', fontSize: '0.85rem', marginTop: '6px' }}>Try lowering the minimum score or using a different query.</div>
        </div>
      )}

      {/* Idle state instruction */}
      {stage === 'idle' && (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(255,101,132,0.03)', borderRadius: '16px', border: '1px dashed rgba(255,101,132,0.15)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🔴</div>
          <div style={{ color: '#c0c0e0', fontWeight: 700, marginBottom: '6px' }}>Start the pipeline</div>
          <div style={{ color: '#555575', fontSize: '0.85rem', maxWidth: '360px', margin: '0 auto', lineHeight: 1.6 }}>
            Pick a preset query or type your own. Posts are scored by problem-signal keywords, then you can
            <strong style={{ color: '#a78bfa' }}> Extract & Import</strong> them directly into the ProblemX archive.
          </div>
        </div>
      )}
    </div>
  );
}
