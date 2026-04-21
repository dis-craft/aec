'use client';
import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useProblems } from '../../context/ProblemsContext';
import { useUser } from '../../context/UserContext';
import { STATUS_CONFIG, DIFFICULTY_CONFIG, URGENCY_CONFIG, SOURCE_CONFIG, FEASIBILITY_CONFIG } from '../../lib/constants';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ConfidenceScore } from '../../components/ui/ConfidenceScore';
import { Modal } from '../../components/ui/Modal';
import { toast } from '../../components/ui/Toast';
import {
  ArrowLeft, AlertTriangle, Lock, CheckCircle2, Users, Clock,
  Zap, Target, Wrench, BookOpen, ExternalLink, Bookmark, BookmarkCheck
} from 'lucide-react';

function InfoRow({ label, value, color }: { label: string; value: React.ReactNode; color?: string }) {
  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#555575', width: '130px', flexShrink: 0, paddingTop: '2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
      <span style={{ fontSize: '0.86rem', color: color || '#c0c0e0', flex: 1 }}>{value}</span>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="card" style={{ padding: '22px', marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        {icon}
        <h2 className="section-title">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export default function ProblemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getProblem, updateStatus, toggleSaved, problems } = useProblems();
  const { role } = useUser();
  const [selectModal, setSelectModal] = useState(false);
  const [selectionData, setSelectionData] = useState({
    studentName: '', teamName: '', reason: '', solutionDirection: '',
    resourcesNeeded: '', mentorSupport: false, timeline: '', deliverable: '', teamRoles: '',
  });

  const problem = getProblem(params.id as string);

  if (!problem) {
    return (
      <div className="page" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '12px' }}>❓</div>
        <div style={{ color: '#c0c0e0', marginBottom: '16px' }}>Problem not found</div>
        <Link href="/archive"><Button variant="secondary">Back to Archive</Button></Link>
      </div>
    );
  }


  const sc = STATUS_CONFIG[problem.status];
  const dc = DIFFICULTY_CONFIG[problem.difficulty];
  const uc = URGENCY_CONFIG[problem.urgency];
  const src = SOURCE_CONFIG[problem.source];
  const fc = FEASIBILITY_CONFIG[problem.feasibility];

  // Related problems (same domain, different id)
  const related = problems.filter(p => p.domain === problem.domain && p.id !== problem.id).slice(0, 3);

  function handleSelect() {
    if (!selectionData.studentName || !selectionData.reason) {
      toast('Please fill in required fields', 'warning');
      return;
    }
    updateStatus(problem!.id, 'selected');
    toast('Problem selected successfully! Good luck 🎉', 'success');
    setSelectModal(false);
  }

  return (
    <div className="page">
      {/* Back */}
      <Link href="/archive" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#666688', fontSize: '0.83rem', marginBottom: '20px' }}>
        <ArrowLeft size={14} /> Back to Archive
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px', alignItems: 'start' }}>
        {/* Left/main */}
        <div>
          {/* Header card */}
          <div className="card" style={{ padding: '28px', marginBottom: '16px', position: 'relative', overflow: 'hidden' }}>
            {problem.urgency === 'critical' && (
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #ff6584, transparent)' }} />
            )}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                  <Badge color={sc.color} bg={sc.bg} dot>{sc.label}</Badge>
                  <Badge color={src.color} bg={`${src.color}18`}>{src.icon} {src.label}</Badge>
                  {problem.isConfidential && <Badge color="#ff6584" bg="rgba(255,101,132,0.1)"><Lock size={10} /> Confidential</Badge>}
                  {problem.duplicateWarning && <Badge color="#f9a825" bg="rgba(249,168,37,0.1)"><AlertTriangle size={10} /> Possible Duplicate</Badge>}
                </div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f0f0ff', lineHeight: 1.3, marginBottom: '12px', letterSpacing: '-0.02em' }}>
                  {problem.title}
                </h1>
                <p style={{ fontSize: '0.9rem', color: '#9999bb', lineHeight: 1.7 }}>{problem.description}</p>

                {problem.sourceUrl && (
                  <a href={problem.sourceUrl} target="_blank" rel="noopener noreferrer" style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '12px',
                    color: '#60a5fa', fontSize: '0.82rem', textDecoration: 'none',
                  }}>
                    <ExternalLink size={12} /> View Source
                  </a>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                <ConfidenceScore score={problem.confidenceScore} size={64} />
                <span style={{ fontSize: '0.65rem', color: '#555575', textAlign: 'center' }}>AI Confidence</span>
                <button
                  onClick={() => toggleSaved(problem.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: problem.isSaved ? '#f9a825' : '#555575', marginTop: '4px' }}
                  title={problem.isSaved ? 'Unsave' : 'Save'}
                >
                  {problem.isSaved ? <BookmarkCheck size={22} color="#f9a825" /> : <Bookmark size={22} />}
                </button>
              </div>
            </div>
          </div>

          {/* Details */}
          <Section title="Problem Details" icon={<BookOpen size={16} color="#6c63ff" />}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <InfoRow label="Domain" value={problem.domain} />
              <InfoRow label="Cause" value={problem.cause} />
              <InfoRow label="Impact" value={problem.impact} />
              <InfoRow label="Frequency" value={problem.frequency} />
              <InfoRow label="Stakeholders" value={problem.affectedStakeholders} />
              {problem.organizationName && <InfoRow label="Organization" value={problem.organizationName} />}
              {problem.location && <InfoRow label="Location" value={problem.location} />}
              <InfoRow label="Submitted by" value={problem.submittedBy} />
              <InfoRow label="Submitted on" value={new Date(problem.submittedAt).toLocaleDateString('en-IN', { dateStyle: 'long' })} />
              {problem.reviewNotes && (
                <div>
                  <hr className="divider" style={{ margin: '8px 0' }} />
                  <InfoRow label="Reviewer notes" value={problem.reviewNotes} color="#c4b5fd" />
                </div>
              )}
            </div>
          </Section>

          {/* Tags and metrics */}
          <Section title="Classification" icon={<Target size={16} color="#a78bfa" />}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
              {problem.tags.map(tag => <span key={tag} className="tag-pill">{tag}</span>)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              {[
                { label: 'Difficulty', value: dc.label, color: dc.color },
                { label: 'Urgency',    value: uc.label, color: uc.color },
                { label: 'Feasibility', value: fc.label, color: fc.color },
              ].map(({ label, value, color }) => (
                <div key={label} style={{
                  textAlign: 'center', padding: '12px',
                  background: `${color}0d`, border: `1px solid ${color}25`, borderRadius: '10px',
                }}>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color }}>{value}</div>
                  <div style={{ fontSize: '0.72rem', color: '#666688', marginTop: '2px' }}>{label}</div>
                </div>
              ))}
            </div>
          </Section>

          {/* Skills & Resources */}
          <Section title="Requirements" icon={<Wrench size={16} color="#43e97b" />}>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '0.75rem', color: '#555575', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Required Skills</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {problem.requiredSkills.map(s => (
                  <span key={s} style={{
                    padding: '4px 12px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 600,
                    background: 'rgba(67,233,123,0.1)', border: '1px solid rgba(67,233,123,0.2)', color: '#43e97b',
                  }}>{s}</span>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#555575', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Resources Needed</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {problem.requiredResources.map(r => (
                  <span key={r} style={{
                    padding: '4px 12px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 600,
                    background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)', color: '#60a5fa',
                  }}>{r}</span>
                ))}
              </div>
            </div>
          </Section>
        </div>

        {/* Right sidebar */}
        <div style={{ position: 'sticky', top: '80px' }}>
          {/* CTA */}
          {role === 'student' && ['published', 'approved'].includes(problem.status) && (
            <div className="card" style={{ padding: '20px', marginBottom: '16px', background: 'linear-gradient(135deg, rgba(108,99,255,0.1), rgba(168,85,247,0.05))' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f0f0ff', marginBottom: '6px' }}>Ready to solve this?</h3>
              <p style={{ fontSize: '0.8rem', color: '#8888aa', marginBottom: '14px', lineHeight: 1.5 }}>
                Select this problem to claim it and start working on a solution.
              </p>
              <Button
                onClick={() => setSelectModal(true)}
                style={{ width: '100%', justifyContent: 'center' }}
                icon={<CheckCircle2 size={16} />}
              >
                Select Problem
              </Button>
            </div>
          )}

          {/* Admin status control */}
          {(role === 'admin' || role === 'reviewer') && (
            <div className="card" style={{ padding: '20px', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#c0c0e0', marginBottom: '12px' }}>Update Status</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {(['approved', 'published', 'archived'] as const).map(s => {
                  const cfg = STATUS_CONFIG[s];
                  return (
                    <button
                      key={s}
                      onClick={() => {
                        updateStatus(problem.id, s);
                        toast(`Status changed to ${cfg.label}`, 'success');
                      }}
                      style={{
                        padding: '8px 14px', border: `1px solid ${cfg.color}30`,
                        borderRadius: '8px', background: problem.status === s ? cfg.bg : 'transparent',
                        color: cfg.color, fontWeight: 600, fontSize: '0.8rem',
                        cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left',
                      }}
                    >
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
              <div style={{ marginTop: '10px' }}>
                <Link href={`/review/${problem.id}`} style={{ textDecoration: 'none' }}>
                  <Button variant="secondary" style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem' }}>
                    Full Review Panel →
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Meta */}
          <div className="card" style={{ padding: '20px', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#c0c0e0', marginBottom: '12px' }}>Meta Info</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <InfoRow label="Source" value={`${src.icon} ${src.label}`} color={src.color} />
              <InfoRow label="Difficulty" value={dc.label} color={dc.color} />
              <InfoRow label="Urgency" value={uc.label} color={uc.color} />
              <InfoRow label="Feasibility" value={fc.label} color={fc.color} />
              <InfoRow label="Confidence" value={`${problem.confidenceScore}%`} />
            </div>
          </div>

          {/* Related */}
          {related.length > 0 && (
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#c0c0e0', marginBottom: '12px' }}>Related Problems</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {related.map(r => (
                  <Link key={r.id} href={`/archive/${r.id}`} style={{ textDecoration: 'none' }}>
                    <div style={{
                      padding: '8px 10px', borderRadius: '8px',
                      background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                      transition: 'all 0.2s',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(108,99,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(108,99,255,0.2)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
                    >
                      <div style={{ fontSize: '0.8rem', color: '#c0c0e0', fontWeight: 600, lineHeight: 1.4 }}
                        className="overflow-hidden text-ellipsis"
                      >{r.title}</div>
                      <div style={{ fontSize: '0.7rem', color: '#555575', marginTop: '2px' }}>{r.domain} · {DIFFICULTY_CONFIG[r.difficulty].label}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Student selection modal */}
      <Modal open={selectModal} onClose={() => setSelectModal(false)} title="Select This Problem" width={600}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[
              { label: 'Your Name *', key: 'studentName', placeholder: 'Rahul Sharma' },
              { label: 'Team Name', key: 'teamName', placeholder: 'Team Alpha' },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label className="form-label">{label}</label>
                <input
                  className="form-input"
                  placeholder={placeholder}
                  value={(selectionData as unknown as Record<string, string>)[key]}
                  onChange={e => setSelectionData(d => ({ ...d, [key]: e.target.value }))}
                />
              </div>
            ))}
          </div>
          {[
            { label: 'Why this problem? *', key: 'reason', placeholder: 'Explain your motivation...' },
            { label: 'Solution direction', key: 'solutionDirection', placeholder: 'Your initial approach...' },
            { label: 'Resources needed', key: 'resourcesNeeded', placeholder: 'Tools, datasets, APIs...' },
            { label: 'Team roles', key: 'teamRoles', placeholder: 'Who handles what...' },
          ].map(({ label, key, placeholder }) => (
            <div key={key}>
              <label className="form-label">{label}</label>
              <textarea
                className="form-input form-textarea"
                style={{ minHeight: '70px' }}
                placeholder={placeholder}
                value={(selectionData as unknown as Record<string, string>)[key]}
                onChange={e => setSelectionData(d => ({ ...d, [key]: e.target.value }))}
              />
            </div>
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[
              { label: 'Expected timeline', key: 'timeline', placeholder: '8 weeks' },
              { label: 'Deliverable', key: 'deliverable', placeholder: 'Working prototype + report' },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label className="form-label">{label}</label>
                <input
                  className="form-input"
                  placeholder={placeholder}
                  value={(selectionData as unknown as Record<string, string>)[key]}
                  onChange={e => setSelectionData(d => ({ ...d, [key]: e.target.value }))}
                />
              </div>
            ))}
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={selectionData.mentorSupport}
              onChange={e => setSelectionData(d => ({ ...d, mentorSupport: e.target.checked }))}
              style={{ accentColor: '#6c63ff', width: '16px', height: '16px' }}
            />
            <span style={{ fontSize: '0.85rem', color: '#c0c0e0' }}>I would like mentor support</span>
          </label>
          <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
            <Button onClick={() => setSelectModal(false)} variant="secondary" style={{ flex: 1, justifyContent: 'center' }}>Cancel</Button>
            <Button onClick={handleSelect} style={{ flex: 1, justifyContent: 'center' }} icon={<CheckCircle2 size={16} />}>
              Confirm Selection
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
