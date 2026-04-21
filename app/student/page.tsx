'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useProblems } from '../context/ProblemsContext';
import { useUser } from '../context/UserContext';
import { ProblemCard } from '../components/archive/ProblemCard';
import { SearchBar } from '../components/archive/SearchBar';
import { Problem } from '../lib/types';
import { STATUS_CONFIG, DIFFICULTY_CONFIG, SOURCE_CONFIG, DOMAINS } from '../lib/constants';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Bookmark, GraduationCap, LayoutGrid, List, Filter, TrendingUp } from 'lucide-react';

export default function StudentPage() {
  const { problems } = useProblems();
  const { role } = useUser();
  const [tab, setTab] = useState<'browse' | 'saved' | 'selected'>('browse');
  const [search, setSearch] = useState('');
  const [filterDomain, setFilterDomain] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const published = problems.filter(p => ['published', 'approved'].includes(p.status));
  const saved = problems.filter(p => p.isSaved);
  const selected = problems.filter(p => ['selected', 'in_progress', 'solved'].includes(p.status));

  function applySearch(list: Problem[]) {
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.domain.toLowerCase().includes(q) ||
      p.tags.some(t => t.includes(q))
    );
  }

  function applyFilters(list: Problem[]) {
    let r = list;
    if (filterDomain) r = r.filter(p => p.domain === filterDomain);
    if (filterDifficulty) r = r.filter(p => p.difficulty === filterDifficulty);
    return r;
  }

  const currentList = applyFilters(applySearch(
    tab === 'browse' ? published : tab === 'saved' ? saved : selected
  ));

  const problemsByDomain = DOMAINS.slice(0, 8).map(d => ({
    domain: d,
    count: published.filter(p => p.domain === d).length,
  })).filter(x => x.count > 0).sort((a, b) => b.count - a.count);

  return (
    <div className="page">
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <GraduationCap size={22} color="#43e97b" />
          <h1 className="page-title">Student Workspace</h1>
        </div>
        <p className="page-subtitle">Browse problems, save favorites, and select one to solve.</p>
      </div>

      {/* Quick stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {[
          { label: 'Available Problems', value: published.length, color: '#43e97b' },
          { label: 'Saved', value: saved.length, color: '#f9a825' },
          { label: 'Selected by Students', value: problems.filter(p => p.status === 'selected').length, color: '#60a5fa' },
          { label: 'Solved', value: problems.filter(p => p.status === 'solved').length, color: '#a78bfa' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card" style={{ padding: '16px 18px' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color, letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: '0.75rem', color: '#666688', marginTop: '4px' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Domain quick-filter chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
        <button
          onClick={() => setFilterDomain('')}
          style={{
            padding: '5px 12px', borderRadius: '999px', fontSize: '0.76rem', fontWeight: 600,
            background: !filterDomain ? 'rgba(108,99,255,0.2)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${!filterDomain ? 'rgba(108,99,255,0.4)' : 'rgba(255,255,255,0.08)'}`,
            color: !filterDomain ? '#a78bfa' : '#666688',
            cursor: 'pointer', transition: 'all 0.2s',
          }}
        >All</button>
        {problemsByDomain.map(({ domain, count }) => (
          <button
            key={domain}
            onClick={() => setFilterDomain(domain === filterDomain ? '' : domain)}
            style={{
              padding: '5px 12px', borderRadius: '999px', fontSize: '0.76rem', fontWeight: 600,
              background: filterDomain === domain ? 'rgba(108,99,255,0.2)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${filterDomain === domain ? 'rgba(108,99,255,0.4)' : 'rgba(255,255,255,0.08)'}`,
              color: filterDomain === domain ? '#a78bfa' : '#888899',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            {domain} <span style={{ opacity: 0.6 }}>({count})</span>
          </button>
        ))}
      </div>

      {/* Tabs + controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', overflow: 'hidden' }}>
          {([
            ['browse', '🔍 Browse', published.length],
            ['saved', '🔖 Saved', saved.length],
            ['selected', '✅ Selected', selected.length],
          ] as const).map(([t, label, count]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: '8px 16px', border: 'none', cursor: 'pointer', fontSize: '0.83rem', fontWeight: 600,
                background: tab === t ? 'rgba(108,99,255,0.25)' : 'transparent',
                color: tab === t ? '#a78bfa' : '#666688', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}
            >
              {label}
              <span style={{
                fontSize: '0.68rem', background: tab === t ? 'rgba(108,99,255,0.3)' : 'rgba(255,255,255,0.08)',
                color: tab === t ? '#c4b5fd' : '#555575', padding: '1px 6px', borderRadius: '999px',
              }}>{count}</span>
            </button>
          ))}
        </div>

        <div style={{ flex: 1, maxWidth: '320px' }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search problems…" />
        </div>

        <select
          className="form-input form-select"
          style={{ width: 'auto', padding: '7px 32px 7px 12px', fontSize: '0.82rem' }}
          value={filterDifficulty}
          onChange={e => setFilterDifficulty(e.target.value)}
        >
          <option value="">All difficulties</option>
          {['easy', 'medium', 'hard', 'research'].map(d => (
            <option key={d} value={d}>{DIFFICULTY_CONFIG[d as keyof typeof DIFFICULTY_CONFIG].label}</option>
          ))}
        </select>

        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', overflow: 'hidden' }}>
          {([['grid', LayoutGrid], ['list', List]] as const).map(([v, Icon]) => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                padding: '6px 10px', border: 'none', cursor: 'pointer',
                background: view === v ? 'rgba(108,99,255,0.25)' : 'transparent',
                color: view === v ? '#a78bfa' : '#555575', transition: 'all 0.2s',
              }}
            >
              <Icon size={16} />
            </button>
          ))}
        </div>
      </div>

      {/* Problem grid/list */}
      {currentList.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          background: '#0e0e1f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px',
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>
            {tab === 'saved' ? '🔖' : tab === 'selected' ? '✅' : '🔍'}
          </div>
          <div style={{ color: '#c0c0e0', fontWeight: 600, marginBottom: '6px' }}>
            {tab === 'saved' ? 'No saved problems yet' : tab === 'selected' ? 'No selected problems' : 'No problems match your search'}
          </div>
          <div style={{ color: '#555575', fontSize: '0.85rem' }}>
            {tab === 'saved' ? 'Click the bookmark icon on any problem to save it.' : 'Try changing your filters.'}
          </div>
          {tab !== 'browse' && (
            <div style={{ marginTop: '16px' }}>
              <Button onClick={() => { setTab('browse'); setSearch(''); setFilterDomain(''); setFilterDifficulty(''); }}>
                Browse Problems
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div style={view === 'grid'
          ? { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }
          : { display: 'flex', flexDirection: 'column', gap: '10px' }
        }>
          {currentList.map(p => (
            <ProblemCard key={p.id} problem={p} view={view} />
          ))}
        </div>
      )}
    </div>
  );
}
