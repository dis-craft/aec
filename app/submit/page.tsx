'use client';
import React from 'react';
import Link from 'next/link';
import { SOURCE_CONFIG } from '../lib/constants';
import { ProblemSource } from '../lib/types';
import { ArrowUpRight, PlusCircle } from 'lucide-react';

const FORM_DESCRIPTIONS: Record<ProblemSource, { title: string; description: string; examples: string[] }> = {
  general: {
    title: 'General Problem',
    description: 'Submit any real-world problem you personally observe or experience.',
    examples: ['Daily inconveniences', 'Community issues', 'Service gaps'],
  },
  industry: {
    title: 'Industry / Company',
    description: 'Problems from companies, startups, workshops, or research labs.',
    examples: ['Workflow bottlenecks', 'Automation needs', 'Process inefficiencies'],
  },
  ngo: {
    title: 'NGO / Social Impact',
    description: 'Community issues, social challenges, and humanitarian problems.',
    examples: ['Rural access', 'Health awareness', 'Environmental damage'],
  },
  campus: {
    title: 'Campus / College',
    description: 'Problems happening in educational institutions and departments.',
    examples: ['Attendance tracking', 'Lab scheduling', 'Fee management'],
  },
  online: {
    title: 'Online Source',
    description: 'Problems collected from Reddit, forums, reviews, and social posts.',
    examples: ['r/freelance complaints', 'App store reviews', 'Support threads'],
  },
};

export default function SubmitPage() {
  return (
    <div className="page">
      <div style={{ marginBottom: '32px' }}>
        <h1 className="page-title">Submit a Problem</h1>
        <p className="page-subtitle">Choose how your problem was discovered, and we'll tailor the form for you.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {(Object.entries(SOURCE_CONFIG) as [ProblemSource, typeof SOURCE_CONFIG[ProblemSource]][]).map(([source, cfg]) => {
          const meta = FORM_DESCRIPTIONS[source];
          return (
            <Link key={source} href={`/submit/${source}`} style={{ textDecoration: 'none' }}>
              <div className="card" style={{
                padding: '24px',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
              }}
                onMouseEnter={e => {
                  const el = e.currentTarget;
                  el.style.borderColor = `${cfg.color}40`;
                  el.style.background = `linear-gradient(135deg, #14142b, ${cfg.color}08)`;
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget;
                  el.style.borderColor = 'rgba(255,255,255,0.07)';
                  el.style.background = '#14142b';
                }}
              >
                <div style={{
                  position: 'absolute', top: 0, right: 0, width: '100px', height: '100px',
                  background: `radial-gradient(circle at top right, ${cfg.color}15 0%, transparent 70%)`,
                }} />

                <div style={{
                  width: 48, height: 48, borderRadius: '14px',
                  background: `${cfg.color}18`, border: `1px solid ${cfg.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.4rem', marginBottom: '14px',
                }}>
                  {cfg.icon}
                </div>

                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: cfg.color, marginBottom: '6px' }}>
                  {meta.title}
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#8888aa', lineHeight: 1.6, marginBottom: '14px' }}>
                  {meta.description}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '16px' }}>
                  {meta.examples.map(ex => (
                    <span key={ex} style={{
                      padding: '2px 8px', borderRadius: '4px', fontSize: '0.68rem',
                      background: `${cfg.color}10`, color: cfg.color, border: `1px solid ${cfg.color}20`,
                    }}>{ex}</span>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: cfg.color, fontWeight: 600, fontSize: '0.82rem' }}>
                  Start form <ArrowUpRight size={13} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div style={{
        marginTop: '32px', padding: '20px 24px',
        background: 'rgba(108,99,255,0.06)', border: '1px solid rgba(108,99,255,0.15)',
        borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '16px',
      }}>
        <PlusCircle size={24} color="#6c63ff" />
        <div>
          <div style={{ fontWeight: 700, color: '#c4b5fd', fontSize: '0.95rem' }}>New to problem submission?</div>
          <div style={{ fontSize: '0.82rem', color: '#777799', marginTop: '2px' }}>
            Start with the <strong style={{ color: '#c4b5fd' }}>General Form</strong> — it works for any type of problem. Our AI will help structure and tag it automatically.
          </div>
        </div>
      </div>
    </div>
  );
}
