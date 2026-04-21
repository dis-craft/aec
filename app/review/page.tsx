'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useProblems } from '../context/ProblemsContext';
import { useUser } from '../context/UserContext';
import { STATUS_CONFIG, DIFFICULTY_CONFIG, SOURCE_CONFIG } from '../lib/constants';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ConfidenceScore } from '../components/ui/ConfidenceScore';
import { toast } from '../components/ui/Toast';
import { CheckCircle2, XCircle, MessageSquare, ArrowUpRight, AlertTriangle, Filter } from 'lucide-react';

export default function ReviewPage() {
  const { problems, updateStatus, updateProblem } = useProblems();
  const { role } = useUser();
  const [statusFilter, setStatusFilter] = useState<string>('submitted,ai_extracted,under_review');
  const [commentMap, setCommentMap] = useState<Record<string, string>>({});

  if (role !== 'admin' && role !== 'reviewer') {
    return (
      <div className="page" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🔒</div>
        <h1 style={{ color: '#f0f0ff', marginBottom: '8px' }}>Access Restricted</h1>
        <p style={{ color: '#8888aa', marginBottom: '20px' }}>Only Admins and Reviewers can access this panel.</p>
        <p style={{ color: '#555575', fontSize: '0.85rem' }}>Switch your role using the dropdown in the top-right corner.</p>
      </div>
    );
  }

  const statuses = statusFilter.split(',');
  const queue = problems
    .filter(p => statuses.includes(p.status))
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

  function approve(id: string) {
    const comment = commentMap[id] || '';
    updateProblem(id, { status: 'approved', reviewedBy: role, reviewedAt: new Date().toISOString(), reviewNotes: comment });
    toast('Problem approved ✓', 'success');
  }

  function publish(id: string) {
    const comment = commentMap[id] || '';
    updateProblem(id, { status: 'published', reviewedBy: role, reviewedAt: new Date().toISOString(), reviewNotes: comment });
    toast('Problem published 🚀', 'success');
  }

  function reject(id: string) {
    updateProblem(id, { status: 'archived', reviewedBy: role, reviewedAt: new Date().toISOString(), reviewNotes: commentMap[id] || 'Rejected by reviewer.' });
    toast('Problem rejected', 'warning');
  }

  function requestDetails(id: string) {
    updateProblem(id, { status: 'under_review', reviewNotes: commentMap[id] || 'More details needed.' });
    toast('Marked as "needs more details"', 'info');
  }

  const FILTER_OPTIONS = [
    { value: 'submitted,ai_extracted,under_review', label: 'Pending Queue' },
    { value: 'approved', label: 'Approved' },
    { value: 'published', label: 'Published' },
    { value: 'archived', label: 'Rejected' },
  ];

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="page-title">Review Panel</h1>
          <p className="page-subtitle">{queue.length} problem{queue.length !== 1 ? 's' : ''} in view</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {FILTER_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              style={{
                padding: '7px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600,
                background: statusFilter === opt.value ? 'rgba(108,99,255,0.2)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${statusFilter === opt.value ? 'rgba(108,99,255,0.4)' : 'rgba(255,255,255,0.08)'}`,
                color: statusFilter === opt.value ? '#a78bfa' : '#666688',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {queue.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: '#0e0e1f', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>✅</div>
          <div style={{ color: '#c0c0e0', fontWeight: 600 }}>All caught up!</div>
          <div style={{ color: '#555575', fontSize: '0.85rem', marginTop: '6px' }}>No problems in this filter.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {queue.map(p => {
            const sc = STATUS_CONFIG[p.status];
            const dc = DIFFICULTY_CONFIG[p.difficulty];
            const src = SOURCE_CONFIG[p.source];
            return (
              <div key={p.id} className="card" style={{ padding: '22px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  {/* Confidence ring */}
                  <ConfidenceScore score={p.confidenceScore} size={52} />

                  {/* Main content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '6px' }}>
                      <Badge color={sc.color} bg={sc.bg} size="sm" dot>{sc.label}</Badge>
                      <Badge color={src.color} bg={`${src.color}18`} size="sm">{src.icon} {src.label}</Badge>
                      <Badge color={dc.color} bg={`${dc.color}18`} size="sm">{dc.label}</Badge>
                      {p.duplicateWarning && <Badge color="#f9a825" bg="rgba(249,168,37,0.1)" size="sm"><AlertTriangle size={9} /> Duplicate?</Badge>}
                    </div>

                    <Link href={`/archive/${p.id}`} style={{ textDecoration: 'none' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#e8e8ff', marginBottom: '4px', cursor: 'pointer', transition: 'color 0.2s' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#a78bfa')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#e8e8ff')}
                      >{p.title}</h3>
                    </Link>

                    <p style={{ fontSize: '0.82rem', color: '#888899', lineHeight: 1.5, marginBottom: '12px' }}>
                      {p.shortSummary}
                    </p>

                    {/* Extracted fields preview */}
                    <div style={{
                      background: 'rgba(108,99,255,0.05)',
                      border: '1px solid rgba(108,99,255,0.1)',
                      borderRadius: '10px', padding: '12px', marginBottom: '14px',
                    }}>
                      <div style={{ fontSize: '0.7rem', color: '#6c63ff', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        🤖 AI Extracted
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        {[
                          ['Domain', p.domain],
                          ['Cause', p.cause],
                          ['Impact', p.impact],
                          ['Stakeholders', p.affectedStakeholders],
                        ].map(([k, v]) => (
                          <div key={k}>
                            <div style={{ fontSize: '0.65rem', color: '#555575', fontWeight: 600 }}>{k}</div>
                            <div style={{ fontSize: '0.78rem', color: '#b0b0d0', lineHeight: 1.4 }}>{v}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ marginTop: '8px' }}>
                        <div style={{ fontSize: '0.65rem', color: '#555575', fontWeight: 600, marginBottom: '4px' }}>Tags</div>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {p.tags.map(t => <span key={t} className="tag-pill" style={{ fontSize: '0.62rem' }}>#{t}</span>)}
                        </div>
                      </div>
                    </div>

                    {/* Reviewer comment */}
                    <div style={{ marginBottom: '14px' }}>
                      <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <MessageSquare size={12} /> Reviewer Comment
                      </label>
                      <textarea
                        className="form-input form-textarea"
                        style={{ minHeight: '60px', fontSize: '0.82rem' }}
                        placeholder="Add notes, corrections, or reason for rejection..."
                        value={commentMap[p.id] || ''}
                        onChange={e => setCommentMap(m => ({ ...m, [p.id]: e.target.value }))}
                      />
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <Button size="sm" variant="success" onClick={() => approve(p.id)} icon={<CheckCircle2 size={14} />}>
                        Approve
                      </Button>
                      <Button size="sm" variant="primary" onClick={() => publish(p.id)} style={{ background: 'rgba(67,233,123,0.2)', color: '#43e97b', border: '1px solid rgba(67,233,123,0.3)', boxShadow: 'none' }} icon={<ArrowUpRight size={14} />}>
                        Approve & Publish
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => requestDetails(p.id)} icon={<MessageSquare size={14} />}>
                        Needs Details
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => reject(p.id)} icon={<XCircle size={14} />}>
                        Reject
                      </Button>
                      <Link href={`/review/${p.id}`} style={{ textDecoration: 'none' }}>
                        <Button size="sm" variant="ghost">Full Edit →</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
