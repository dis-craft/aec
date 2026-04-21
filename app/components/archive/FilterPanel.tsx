'use client';
import React from 'react';
import { DOMAINS, TAGS, DIFFICULTY_CONFIG, URGENCY_CONFIG, SOURCE_CONFIG, STATUS_CONFIG } from '../../lib/constants';
import { Difficulty, Urgency, ProblemSource, ProblemStatus } from '../../lib/types';
import { X, SlidersHorizontal } from 'lucide-react';

interface Filters {
  domain: string;
  difficulty: string;
  urgency: string;
  source: string;
  status: string;
  tags: string[];
}

interface FilterPanelProps {
  filters: Filters;
  onChange: (f: Filters) => void;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: '0.72rem', fontWeight: 700, color: '#555575',
      textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px',
    }}>
      {children}
    </div>
  );
}

function FilterBtn({ active, onClick, children, color }: { active: boolean; onClick: () => void; children: React.ReactNode; color?: string }) {
  const c = color || '#6c63ff';
  return (
    <button
      onClick={onClick}
      style={{
        padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 500,
        background: active ? `${c}22` : 'rgba(255,255,255,0.03)',
        border: `1px solid ${active ? `${c}40` : 'rgba(255,255,255,0.07)'}`,
        color: active ? c : '#778899',
        cursor: 'pointer', transition: 'all 0.15s',
      }}
    >
      {children}
    </button>
  );
}

export function FilterPanel({ filters, onChange }: FilterPanelProps) {
  function set(key: keyof Filters, value: string) {
    onChange({ ...filters, [key]: filters[key] === value ? '' : value });
  }
  function toggleTag(tag: string) {
    const has = filters.tags.includes(tag);
    onChange({ ...filters, tags: has ? filters.tags.filter(t => t !== tag) : [...filters.tags, tag] });
  }

  const hasFilters = filters.domain || filters.difficulty || filters.urgency || filters.source || filters.status || filters.tags.length > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <SlidersHorizontal size={14} color="#6c63ff" />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#c0c0e0' }}>Filters</span>
        </div>
        {hasFilters && (
          <button
            onClick={() => onChange({ domain: '', difficulty: '', urgency: '', source: '', status: '', tags: [] })}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff6584', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '3px' }}
          >
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {/* Status */}
      <div>
        <SectionTitle>Status</SectionTitle>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
          {(Object.entries(STATUS_CONFIG) as [ProblemStatus, typeof STATUS_CONFIG[ProblemStatus]][])
            .map(([status, cfg]) => (
              <FilterBtn key={status} active={filters.status === status} onClick={() => set('status', status)} color={cfg.color}>
                {cfg.label}
              </FilterBtn>
            ))}
        </div>
      </div>

      {/* Source */}
      <div>
        <SectionTitle>Source</SectionTitle>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
          {(Object.entries(SOURCE_CONFIG) as [ProblemSource, typeof SOURCE_CONFIG[ProblemSource]][])
            .map(([source, cfg]) => (
              <FilterBtn key={source} active={filters.source === source} onClick={() => set('source', source)} color={cfg.color}>
                {cfg.icon} {cfg.label}
              </FilterBtn>
            ))}
        </div>
      </div>

      {/* Difficulty */}
      <div>
        <SectionTitle>Difficulty</SectionTitle>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
          {(Object.entries(DIFFICULTY_CONFIG) as [Difficulty, typeof DIFFICULTY_CONFIG[Difficulty]][])
            .map(([d, cfg]) => (
              <FilterBtn key={d} active={filters.difficulty === d} onClick={() => set('difficulty', d)} color={cfg.color}>
                {cfg.label}
              </FilterBtn>
            ))}
        </div>
      </div>

      {/* Urgency */}
      <div>
        <SectionTitle>Urgency</SectionTitle>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
          {(Object.entries(URGENCY_CONFIG) as [Urgency, typeof URGENCY_CONFIG[Urgency]][])
            .map(([u, cfg]) => (
              <FilterBtn key={u} active={filters.urgency === u} onClick={() => set('urgency', u)} color={cfg.color}>
                {cfg.label}
              </FilterBtn>
            ))}
        </div>
      </div>

      {/* Domain */}
      <div>
        <SectionTitle>Domain</SectionTitle>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
          {DOMAINS.map(d => (
            <FilterBtn key={d} active={filters.domain === d} onClick={() => set('domain', d)}>
              {d}
            </FilterBtn>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div>
        <SectionTitle>Tags</SectionTitle>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
          {TAGS.slice(0, 14).map(tag => (
            <FilterBtn key={tag} active={filters.tags.includes(tag)} onClick={() => toggleTag(tag)}>
              #{tag}
            </FilterBtn>
          ))}
        </div>
      </div>
    </div>
  );
}
