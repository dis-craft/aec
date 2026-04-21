'use client';
import React from 'react';
import Link from 'next/link';
import { Problem } from '../../lib/types';
import { STATUS_CONFIG, DIFFICULTY_CONFIG, URGENCY_CONFIG, SOURCE_CONFIG } from '../../lib/constants';
import { Badge } from '../ui/Badge';
import { ConfidenceScore } from '../ui/ConfidenceScore';
import { AlertTriangle, Bookmark, BookmarkCheck, ArrowUpRight } from 'lucide-react';
import { useProblems } from '../../context/ProblemsContext';

interface ProblemCardProps {
  problem: Problem;
  view?: 'grid' | 'list';
}

export function ProblemCard({ problem: p, view = 'grid' }: ProblemCardProps) {
  const { toggleSaved } = useProblems();
  const sc = STATUS_CONFIG[p.status];
  const dc = DIFFICULTY_CONFIG[p.difficulty];
  const uc = URGENCY_CONFIG[p.urgency];
  const src = SOURCE_CONFIG[p.source];

  const isList = view === 'list';

  return (
    <div className="card" style={{
      padding: '18px 20px',
      display: 'flex',
      flexDirection: isList ? 'row' : 'column',
      gap: isList ? '20px' : '14px',
      alignItems: isList ? 'center' : 'flex-start',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Urgency stripe */}
      {p.urgency === 'critical' && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
          background: 'linear-gradient(90deg, #ff6584, #ff6584AA)',
        }} />
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
          <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{src.icon}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Link href={`/archive/${p.id}`} style={{ textDecoration: 'none' }}>
              <h3 style={{
                fontSize: '0.92rem', fontWeight: 700, color: '#e8e8ff',
                lineHeight: 1.4,
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: isList ? 1 : 2,
                WebkitBoxOrient: 'vertical',
                cursor: 'pointer',
                transition: 'color 0.2s',
              }}
                onMouseEnter={e => (e.currentTarget.style.color = '#a78bfa')}
                onMouseLeave={e => (e.currentTarget.style.color = '#e8e8ff')}
              >
                {p.title}
              </h3>
            </Link>
            {!isList && (
              <p style={{
                fontSize: '0.78rem',
                lineHeight: 1.5, marginTop: '4px',
                color: '#888899',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}>{p.shortSummary || p.description}</p>
            )}
          </div>

          {/* Confidence + save */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
            <ConfidenceScore score={p.confidenceScore} size={44} />
            <button
              onClick={e => { e.preventDefault(); e.stopPropagation(); toggleSaved(p.id); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: p.isSaved ? '#f9a825' : '#555575', padding: '2px' }}
              title={p.isSaved ? 'Unsave' : 'Save'}
            >
              {p.isSaved ? <BookmarkCheck size={16} color="#f9a825" /> : <Bookmark size={16} />}
            </button>
          </div>
        </div>

        {/* Badges row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '10px' }}>
          <Badge color={sc.color} bg={sc.bg} size="sm" dot>{sc.label}</Badge>
          <Badge color={dc.color} bg={`${dc.color}18`} size="sm">⚡ {dc.label}</Badge>
          <Badge color={uc.color} bg={`${uc.color}18`} size="sm">🔥 {uc.label}</Badge>
          <Badge color={src.color} bg={`${src.color}18`} size="sm">{src.icon} {src.label}</Badge>
        </div>

        {/* Tags */}
        {!isList && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '10px' }}>
            {p.tags.slice(0, 4).map(tag => (
              <span key={tag} className="tag-pill" style={{ fontSize: '0.65rem' }}>{tag}</span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.73rem', color: '#555575' }}>
              {p.domain}
            </span>
            {p.duplicateWarning && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <AlertTriangle size={11} color="#f9a825" />
                <span style={{ fontSize: '0.68rem', color: '#f9a825' }}>Duplicate</span>
              </div>
            )}
            {p.isConfidential && (
              <Badge color="#ff6584" bg="rgba(255,101,132,0.1)" size="sm">🔒 Confidential</Badge>
            )}
          </div>
          <Link href={`/archive/${p.id}`} style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '3px',
              fontSize: '0.73rem', color: '#6c63ff', fontWeight: 600,
            }}>
              View <ArrowUpRight size={12} />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
