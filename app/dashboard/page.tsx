'use client';
import React from 'react';
import { useProblems } from '../context/ProblemsContext';
import { useUser } from '../context/UserContext';
import Link from 'next/link';
import {
  TrendingUp, Clock, CheckCircle2, XCircle, Users,
  Trophy, PlusCircle, Layers, ArrowUpRight, Zap, AlertTriangle
} from 'lucide-react';
import { DOMAINS, STATUS_CONFIG } from '../lib/constants';
import { ProblemStatus } from '../lib/types';

function StatCard({
  label, value, icon: Icon, color, href
}: { label: string; value: number; icon: React.FC<{ size?: number; color?: string }>; color: string; href?: string }) {
  const content = (
    <div className="card" style={{ padding: '20px 24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', top: 0, right: 0, width: '80px', height: '80px',
        background: `radial-gradient(circle at top right, ${color}18 0%, transparent 70%)`,
        borderRadius: '0 16px 0 80px',
      }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div className="stat-num">{value}</div>
          <div style={{ fontSize: '0.82rem', color: '#777799', marginTop: '4px', fontWeight: 500 }}>{label}</div>
        </div>
        <div style={{
          width: 40, height: 40, borderRadius: '12px',
          background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon size={20} color={color} />
        </div>
      </div>
      {href && (
        <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '0.75rem', color }}>View details</span>
          <ArrowUpRight size={12} color={color} />
        </div>
      )}
    </div>
  );
  return href ? <Link href={href} style={{ textDecoration: 'none' }}>{content}</Link> : content;
}

export default function DashboardPage() {
  const { problems, stats } = useProblems();
  const { role } = useUser();

  // Domain frequency
  const domainCount: Record<string, number> = {};
  problems.forEach(p => { domainCount[p.domain] = (domainCount[p.domain] || 0) + 1; });
  const topDomains = Object.entries(domainCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  const maxCount = topDomains[0]?.[1] || 1;

  // Recent submissions
  const recent = [...problems]
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .slice(0, 5);

  const reviewPending = problems.filter(p =>
    ['submitted', 'ai_extracted', 'under_review'].includes(p.status)
  ).length;

  return (
    <div className="page">
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <div style={{
            padding: '4px 12px', borderRadius: '999px',
            background: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.25)',
            fontSize: '0.75rem', color: '#a78bfa', fontWeight: 600,
          }}>Dashboard</div>
        </div>
        <h1 className="page-title">Welcome to ProblemX ⚡</h1>
        <p className="page-subtitle">Track, manage, and discover real-world problem statements</p>
      </div>

      {/* Review alert for admins/reviewers */}
      {(role === 'admin' || role === 'reviewer') && reviewPending > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          background: 'rgba(249,168,37,0.08)',
          border: '1px solid rgba(249,168,37,0.25)',
          borderRadius: '12px', padding: '14px 18px', marginBottom: '24px',
        }}>
          <AlertTriangle size={18} color="#f9a825" />
          <div style={{ flex: 1 }}>
            <span style={{ color: '#f9a825', fontWeight: 600, fontSize: '0.88rem' }}>
              {reviewPending} problem{reviewPending > 1 ? 's' : ''} pending review
            </span>
            <span style={{ color: '#8888aa', fontSize: '0.83rem', marginLeft: '8px' }}>
              — waiting for your approval
            </span>
          </div>
          <Link href="/review" style={{
            textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600,
            color: '#f9a825', display: 'flex', alignItems: 'center', gap: '4px',
          }}>
            Go to Review <ArrowUpRight size={14} />
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid-3" style={{ marginBottom: '28px' }}>
        <StatCard label="Total Problems"   value={stats.total}     icon={Layers}       color="#6c63ff" href="/archive" />
        <StatCard label="Pending Review"   value={stats.pending}   icon={Clock}        color="#f9a825" href="/review" />
        <StatCard label="Published"        value={stats.published} icon={CheckCircle2} color="#43e97b" href="/archive" />
        <StatCard label="Selected"         value={stats.selected}  icon={Users}        color="#60a5fa" />
        <StatCard label="Solved"           value={stats.solved}    icon={Trophy}       color="#ff6584" />
        <StatCard label="Archived"         value={stats.rejected}  icon={XCircle}      color="#666688" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>
        {/* Domain chart */}
        <div className="card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <TrendingUp size={18} color="#6c63ff" />
            <h2 className="section-title">Trending Domains</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {topDomains.length === 0 ? (
              <p style={{ color: '#666688', fontSize: '0.85rem' }}>No data yet</p>
            ) : topDomains.map(([domain, count]) => (
              <div key={domain}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontSize: '0.82rem', color: '#c0c0e0', fontWeight: 500 }}>{domain}</span>
                  <span style={{ fontSize: '0.78rem', color: '#6c63ff', fontWeight: 700 }}>{count}</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${(count / maxCount) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status distribution */}
        <div className="card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <Layers size={18} color="#a78bfa" />
            <h2 className="section-title">Status Overview</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(Object.entries(STATUS_CONFIG) as [ProblemStatus, typeof STATUS_CONFIG[ProblemStatus]][]).map(([status, cfg]) => {
              const count = problems.filter(p => p.status === status).length;
              if (count === 0) return null;
              return (
                <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: '0.8rem', color: '#aaaacc' }}>{cfg.label}</span>
                  <span style={{
                    fontSize: '0.78rem', fontWeight: 700, color: cfg.color,
                    background: cfg.bg, padding: '2px 8px', borderRadius: '999px',
                  }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Activity + Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Recent */}
        <div className="card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} color="#60a5fa" />
              <h2 className="section-title">Recent Submissions</h2>
            </div>
            <Link href="/archive" style={{
              fontSize: '0.78rem', color: '#6c63ff', textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: '3px',
            }}>
              View all <ArrowUpRight size={12} />
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {recent.map((p, i) => {
              const sc = STATUS_CONFIG[p.status];
              return (
                <Link key={p.id} href={`/archive/${p.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '10px 12px', borderRadius: '10px',
                    transition: 'background 0.2s',
                    background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(108,99,255,0.08)')}
                    onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent')}
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: '8px',
                      background: 'rgba(108,99,255,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.8rem', flexShrink: 0,
                    }}>
                      {p.source === 'industry' ? '🏭' : p.source === 'ngo' ? '🤝' : p.source === 'campus' ? '🎓' : p.source === 'online' ? '🌐' : '📝'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '0.85rem', fontWeight: 600, color: '#e0e0f8',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>{p.title}</div>
                      <div style={{ fontSize: '0.75rem', color: '#666688', marginTop: '1px' }}>
                        {p.domain} · {new Date(p.submittedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <span style={{
                      fontSize: '0.7rem', fontWeight: 600, color: sc.color,
                      background: sc.bg, padding: '2px 8px', borderRadius: '999px',
                      border: `1px solid ${sc.color}30`, whiteSpace: 'nowrap',
                    }}>{sc.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <Zap size={18} color="#f9a825" />
            <h2 className="section-title">Quick Actions</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { label: 'Submit a Problem', href: '/submit', color: '#6c63ff', icon: '📝' },
              { label: 'Browse Archive',   href: '/archive', color: '#43e97b', icon: '📚' },
              { label: 'Review Queue',     href: '/review',  color: '#f9a825', icon: '🔍' },
              { label: 'Student Space',    href: '/student', color: '#60a5fa', icon: '🎓' },
              { label: 'Analytics',        href: '/analytics', color: '#ff6584', icon: '📊' },
            ].map(({ label, href, color, icon }) => (
              <Link key={href} href={href} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '11px 14px', borderRadius: '10px',
                  background: `${color}0d`, border: `1px solid ${color}20`,
                  transition: 'all 0.2s', cursor: 'pointer',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${color}1a`; e.currentTarget.style.borderColor = `${color}40`; }}
                  onMouseLeave={e => { e.currentTarget.style.background = `${color}0d`; e.currentTarget.style.borderColor = `${color}20`; }}
                >
                  <span style={{ fontSize: '1rem' }}>{icon}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#d0d0f0' }}>{label}</span>
                  <ArrowUpRight size={14} color={color} style={{ marginLeft: 'auto' }} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
