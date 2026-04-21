'use client';
import React from 'react';
import { useProblems } from '../context/ProblemsContext';
import { DOMAINS, SOURCE_CONFIG, DIFFICULTY_CONFIG, STATUS_CONFIG } from '../lib/constants';
import { ProblemSource, Difficulty, ProblemStatus } from '../lib/types';
import { BarChart3, PieChart, TrendingUp, Award } from 'lucide-react';

function Bar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
        <span style={{ fontSize: '0.8rem', color: '#b0b0d0', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: '0.78rem', fontWeight: 700, color }}>{value}</span>
      </div>
      <div className="progress-track">
        <div style={{
          height: '100%', borderRadius: '999px',
          background: color,
          width: `${pct}%`, transition: 'width 0.6s ease',
        }} />
      </div>
    </div>
  );
}

function DonutSegment({ value, total, color, offset }: { value: number; total: number; color: string; offset: number }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const frac = total > 0 ? value / total : 0;
  const dash = frac * circ;
  return (
    <circle
      cx="60" cy="60" r={r}
      fill="none" stroke={color} strokeWidth="14"
      strokeDasharray={`${dash} ${circ - dash}`}
      strokeDashoffset={-offset}
      transform="rotate(-90 60 60)"
    />
  );
}

export default function AnalyticsPage() {
  const { problems } = useProblems();
  const total = problems.length;

  // Domain frequency
  const domainData = DOMAINS.map(d => ({
    domain: d, count: problems.filter(p => p.domain === d).length,
  })).filter(x => x.count > 0).sort((a, b) => b.count - a.count);
  const maxDomain = domainData[0]?.count || 1;

  // Source breakdown
  const sourceData = (Object.keys(SOURCE_CONFIG) as ProblemSource[]).map(s => ({
    source: s, label: SOURCE_CONFIG[s].label, icon: SOURCE_CONFIG[s].icon,
    color: SOURCE_CONFIG[s].color,
    count: problems.filter(p => p.source === s).length,
  })).filter(x => x.count > 0);

  // Difficulty
  const diffData = (['easy', 'medium', 'hard', 'research'] as Difficulty[]).map(d => ({
    diff: d, ...DIFFICULTY_CONFIG[d],
    count: problems.filter(p => p.difficulty === d).length,
  }));
  const maxDiff = Math.max(...diffData.map(x => x.count), 1);

  // Status pipeline
  const statusData = (['submitted', 'ai_extracted', 'under_review', 'approved', 'published', 'selected', 'in_progress', 'solved'] as ProblemStatus[]).map(s => ({
    status: s, ...STATUS_CONFIG[s],
    count: problems.filter(p => p.status === s).length,
  }));

  // Top 5 most selected / highest confidence
  const topByConfidence = [...problems].sort((a, b) => b.confidenceScore - a.confidenceScore).slice(0, 5);

  // Donut segments for source
  let circ = 2 * Math.PI * 52;
  let cumulOffset = 0;
  const donutSegments = sourceData.map(s => {
    const seg = { ...s, offset: cumulOffset };
    cumulOffset += (s.count / total) * circ;
    return seg;
  });

  const avgConfidence = total > 0
    ? Math.round(problems.reduce((a, b) => a + b.confidenceScore, 0) / total)
    : 0;

  return (
    <div className="page">
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <BarChart3 size={22} color="#ff6584" />
          <h1 className="page-title">Analytics</h1>
        </div>
        <p className="page-subtitle">Insights across all {total} problem{total !== 1 ? 's' : ''} in the system</p>
      </div>

      {/* Summary cards */}
      <div className="grid-4" style={{ marginBottom: '28px' }}>
        {[
          { label: 'Total Problems', value: total, color: '#6c63ff' },
          { label: 'Published', value: problems.filter(p => p.status === 'published').length, color: '#43e97b' },
          { label: 'Avg. Confidence', value: `${avgConfidence}%`, color: '#60a5fa' },
          { label: 'Solved', value: problems.filter(p => p.status === 'solved').length, color: '#f9a825' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card" style={{ padding: '18px 20px' }}>
            <div style={{ fontSize: '1.9rem', fontWeight: 900, color, lineHeight: 1, letterSpacing: '-0.03em' }}>{value}</div>
            <div style={{ fontSize: '0.75rem', color: '#666688', marginTop: '4px' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* Domain bar chart */}
        <div className="card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <BarChart3 size={16} color="#6c63ff" />
            <h2 className="section-title">Problems by Domain</h2>
          </div>
          {domainData.length === 0 ? (
            <p style={{ color: '#555575', fontSize: '0.85rem' }}>No data yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {domainData.map(({ domain, count }, i) => {
                const colors = ['#6c63ff', '#43e97b', '#60a5fa', '#f9a825', '#ff6584', '#a78bfa', '#fb923c'];
                return (
                  <Bar key={domain} label={domain} value={count} max={maxDomain} color={colors[i % colors.length]} />
                );
              })}
            </div>
          )}
        </div>

        {/* Source donut */}
        <div className="card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <PieChart size={16} color="#ff6584" />
            <h2 className="section-title">Source Breakdown</h2>
          </div>

          {sourceData.length === 0 ? (
            <p style={{ color: '#555575', fontSize: '0.85rem' }}>No data yet</p>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '18px' }}>
                <svg width="120" height="120" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="14" />
                  {donutSegments.map(seg => (
                    <DonutSegment key={seg.source} value={seg.count} total={total} color={seg.color} offset={seg.offset} />
                  ))}
                  <text x="60" y="64" textAnchor="middle" fill="#f0f0ff" fontSize="14" fontWeight="800">{total}</text>
                  <text x="60" y="76" textAnchor="middle" fill="#666688" fontSize="7">problems</text>
                </svg>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {sourceData.map(s => (
                  <div key={s.source} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: '0.78rem', color: '#9999bb' }}>{s.icon} {s.label}</span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: s.color }}>{s.count}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* Difficulty */}
        <div className="card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <TrendingUp size={16} color="#f9a825" />
            <h2 className="section-title">Difficulty Distribution</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {diffData.map(({ diff, label, color, count }) => (
              <Bar key={diff} label={label} value={count} max={maxDiff} color={color} />
            ))}
          </div>
        </div>

        {/* Status pipeline */}
        <div className="card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <TrendingUp size={16} color="#43e97b" />
            <h2 className="section-title">Status Pipeline</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {statusData.map(({ status, label, color, bg, count }) => (
              <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: '0.8rem', color: '#9999bb' }}>{label}</span>
                <span style={{
                  fontSize: '0.75rem', fontWeight: 700, color,
                  background: bg, padding: '2px 8px', borderRadius: '999px', minWidth: '28px', textAlign: 'center',
                }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top problems by confidence */}
      <div className="card" style={{ padding: '22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <Award size={16} color="#a78bfa" />
          <h2 className="section-title">Highest Confidence Problems</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {topByConfidence.map((p, i) => (
            <div key={p.id} style={{
              display: 'flex', alignItems: 'center', gap: '14px',
              padding: '10px 12px', borderRadius: '10px',
              background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
            }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#555575', width: '20px' }}>#{i + 1}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#d0d0f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div>
                <div style={{ fontSize: '0.73rem', color: '#555575' }}>{p.domain} · {SOURCE_CONFIG[p.source].label}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: p.confidenceScore >= 80 ? '#43e97b' : p.confidenceScore >= 60 ? '#f9a825' : '#ff6584' }}>
                  {p.confidenceScore}%
                </span>
                <span style={{ fontSize: '0.65rem', color: '#555575' }}>confidence</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
