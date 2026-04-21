'use client';
import React, { useState, useMemo } from 'react';
import { useProblems } from '../context/ProblemsContext';
import { ProblemCard } from '../components/archive/ProblemCard';
import { FilterPanel } from '../components/archive/FilterPanel';
import { SearchBar } from '../components/archive/SearchBar';
import { LayoutGrid, List, SortAsc } from 'lucide-react';

export default function ArchivePage() {
  const { problems } = useProblems();
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [sort, setSort] = useState<'date' | 'difficulty' | 'urgency' | 'confidence'>('date');
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState({
    domain: '', difficulty: '', urgency: '', source: '', status: '', tags: [] as string[],
  });

  const filtered = useMemo(() => {
    let result = [...problems];

    // Text search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.domain.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q)) ||
        (p.sourceUrl || '').toLowerCase().includes(q)
      );
    }

    // Filters
    if (filters.domain) result = result.filter(p => p.domain === filters.domain);
    if (filters.difficulty) result = result.filter(p => p.difficulty === filters.difficulty);
    if (filters.urgency) result = result.filter(p => p.urgency === filters.urgency);
    if (filters.source) result = result.filter(p => p.source === filters.source);
    if (filters.status) result = result.filter(p => p.status === filters.status);
    if (filters.tags.length) result = result.filter(p => filters.tags.every(t => p.tags.includes(t)));

    // Sort
    const diffOrder = { easy: 0, medium: 1, hard: 2, research: 3 };
    const urgOrder = { low: 0, medium: 1, high: 2, critical: 3 };
    result.sort((a, b) => {
      if (sort === 'date') return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
      if (sort === 'difficulty') return diffOrder[b.difficulty] - diffOrder[a.difficulty];
      if (sort === 'urgency') return urgOrder[b.urgency] - urgOrder[a.urgency];
      if (sort === 'confidence') return b.confidenceScore - a.confidenceScore;
      return 0;
    });

    return result;
  }, [problems, search, filters, sort]);

  return (
    <div className="page" style={{ padding: 0 }}>
      {/* Top bar */}
      <div style={{
        padding: '24px 32px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(14,14,31,0.6)',
        backdropFilter: 'blur(10px)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <h1 className="page-title">Problem Archive</h1>
            <p className="page-subtitle">{filtered.length} problem{filtered.length !== 1 ? 's' : ''} found</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Sort */}
            <select
              className="form-input form-select"
              style={{ width: 'auto', padding: '7px 32px 7px 12px', fontSize: '0.82rem' }}
              value={sort}
              onChange={e => setSort(e.target.value as typeof sort)}
            >
              <option value="date">Newest first</option>
              <option value="difficulty">By difficulty</option>
              <option value="urgency">By urgency</option>
              <option value="confidence">By confidence</option>
            </select>

            {/* View toggle */}
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', overflow: 'hidden' }}>
              {([['grid', LayoutGrid], ['list', List]] as const).map(([v, Icon]) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  style={{
                    padding: '6px 10px', border: 'none', cursor: 'pointer',
                    background: view === v ? 'rgba(108,99,255,0.25)' : 'transparent',
                    color: view === v ? '#a78bfa' : '#555575',
                    transition: 'all 0.2s',
                  }}
                >
                  <Icon size={16} />
                </button>
              ))}
            </div>
          </div>
        </div>
        <SearchBar value={search} onChange={setSearch} />
      </div>

      {/* Body */}
      <div style={{ display: 'flex', padding: '24px 32px', gap: '24px' }}>
        {/* Filter sidebar */}
        {showFilters && (
          <div style={{
            width: '240px', flexShrink: 0,
            background: '#0e0e1f', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '16px', padding: '20px', height: 'fit-content',
            position: 'sticky', top: '120px',
          }}>
            <FilterPanel filters={filters} onChange={setFilters} />
          </div>
        )}

        {/* Cards */}
        <div style={{ flex: 1 }}>
          {filtered.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '60px 20px',
              background: '#0e0e1f', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '16px',
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🔍</div>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: '#c0c0e0', marginBottom: '6px' }}>No problems found</div>
              <div style={{ fontSize: '0.85rem', color: '#555575' }}>Try adjusting your search or filters</div>
            </div>
          ) : (
            <div style={view === 'grid'
              ? { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }
              : { display: 'flex', flexDirection: 'column', gap: '10px' }
            }>
              {filtered.map(p => (
                <ProblemCard key={p.id} problem={p} view={view} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
