'use client';
import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useProblems } from '../../context/ProblemsContext';
import { useUser } from '../../context/UserContext';
import { DOMAINS, TAGS, DIFFICULTY_CONFIG, STATUS_CONFIG } from '../../lib/constants';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ConfidenceScore } from '../../components/ui/ConfidenceScore';
import { toast } from '../../components/ui/Toast';
import { ArrowLeft, Save, CheckCircle2, XCircle, Eye } from 'lucide-react';

export default function ReviewDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getProblem, updateProblem } = useProblems();
  const { role } = useUser();
  const [edits, setEdits] = useState<Record<string, unknown>>({});

  const problem = getProblem(params.id as string);

  const get = (key: string) => (key in edits ? edits[key] : problem ? (problem as unknown as Record<string, unknown>)[key] : undefined);
  const set = (key: string, val: unknown) => setEdits(e => ({ ...e, [key]: val }));

  if (role !== 'admin' && role !== 'reviewer') {
    return (
      <div className="page" style={{ textAlign: 'center', color: '#c0c0e0' }}>
        Access restricted. Switch to Admin or Reviewer role.
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="page" style={{ textAlign: 'center', color: '#c0c0e0' }}>
        Problem not found. <Link href="/review" style={{ color: '#6c63ff' }}>Back to review.</Link>
      </div>
    );
  }

  function save() {
    updateProblem(problem!.id, { ...edits as object, reviewedBy: role, reviewedAt: new Date().toISOString() });
    toast('Changes saved', 'success');
  }

  function approve() {
    updateProblem(problem!.id, { ...edits as object, status: 'approved', reviewedBy: role, reviewedAt: new Date().toISOString() });
    toast('Problem approved ✓', 'success');
    router.push('/review');
  }

  function publish() {
    updateProblem(problem!.id, { ...edits as object, status: 'published', reviewedBy: role, reviewedAt: new Date().toISOString() });
    toast('Problem published 🚀', 'success');
    router.push('/review');
  }

  function reject() {
    updateProblem(problem!.id, { ...edits as object, status: 'archived', reviewedBy: role, reviewedAt: new Date().toISOString() });
    toast('Problem rejected', 'warning');
    router.push('/review');
  }

  const InputRow = ({ label, field, textarea = false }: { label: string; field: string; textarea?: boolean }) => (
    <div>
      <label className="form-label">{label}</label>
      {textarea ? (
        <textarea className="form-input form-textarea" value={String(get(field) ?? '')} onChange={e => set(field, e.target.value)} />
      ) : (
        <input className="form-input" value={String(get(field) ?? '')} onChange={e => set(field, e.target.value)} />
      )}
    </div>
  );

  const SelectRow = ({ label, field, options }: { label: string; field: string; options: readonly string[] }) => (
    <div>
      <label className="form-label">{label}</label>
      <select className="form-input form-select" value={String(get(field) ?? '')} onChange={e => set(field, e.target.value)}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <div className="page">
      <Link href="/review" style={{
        textDecoration: 'none', display: 'inline-flex', alignItems: 'center',
        gap: '6px', color: '#666688', fontSize: '0.83rem', marginBottom: '20px',
      }}>
        <ArrowLeft size={14} /> Back to Review Queue
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <ConfidenceScore score={problem.confidenceScore} size={56} />
          <div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f0f0ff' }}>{problem.title}</h1>
            <div style={{ display: 'flex', gap: '6px', marginTop: '5px' }}>
              <Badge color={STATUS_CONFIG[problem.status].color} bg={STATUS_CONFIG[problem.status].bg} size="sm" dot>
                {STATUS_CONFIG[problem.status].label}
              </Badge>
              {problem.aiExtracted && (
                <Badge color="#a78bfa" bg="rgba(167,139,250,0.1)" size="sm">🤖 AI Extracted</Badge>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Link href={`/archive/${problem.id}`} style={{ textDecoration: 'none' }}>
            <Button size="sm" variant="ghost" icon={<Eye size={14} />}>Preview</Button>
          </Link>
          <Button size="sm" variant="secondary" onClick={save} icon={<Save size={14} />}>Save Draft</Button>
          <Button size="sm" variant="success" onClick={approve} icon={<CheckCircle2 size={14} />}>Approve</Button>
          <Button size="sm" onClick={publish} icon={<CheckCircle2 size={14} />}>Publish</Button>
          <Button size="sm" variant="danger" onClick={reject} icon={<XCircle size={14} />}>Reject</Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Core fields */}
        <div className="card" style={{ padding: '22px', gridColumn: '1 / -1' }}>
          <h2 className="section-title" style={{ marginBottom: '18px' }}>Core Information</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <InputRow label="Title" field="title" />
            <InputRow label="Description" field="description" textarea />
            <InputRow label="Short Summary" field="shortSummary" textarea />
          </div>
        </div>

        {/* Classification */}
        <div className="card" style={{ padding: '22px' }}>
          <h2 className="section-title" style={{ marginBottom: '18px' }}>Classification</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <SelectRow label="Domain" field="domain" options={DOMAINS} />
            <SelectRow label="Difficulty" field="difficulty" options={['easy', 'medium', 'hard', 'research']} />
            <SelectRow label="Urgency" field="urgency" options={['low', 'medium', 'high', 'critical']} />
            <SelectRow label="Feasibility" field="feasibility" options={['low', 'medium', 'high']} />
          </div>
        </div>

        {/* Context */}
        <div className="card" style={{ padding: '22px' }}>
          <h2 className="section-title" style={{ marginBottom: '18px' }}>Context</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <InputRow label="Cause" field="cause" textarea />
            <InputRow label="Impact" field="impact" textarea />
            <InputRow label="Frequency" field="frequency" />
            <InputRow label="Affected Stakeholders" field="affectedStakeholders" />
          </div>
        </div>

        {/* Tags editor */}
        <div className="card" style={{ padding: '22px', gridColumn: '1 / -1' }}>
          <h2 className="section-title" style={{ marginBottom: '12px' }}>Tags</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {TAGS.map(tag => {
              const currentTags: string[] = (get('tags') as string[]) || [];
              const active = currentTags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => {
                    const updated = active ? currentTags.filter(t => t !== tag) : [...currentTags, tag];
                    set('tags', updated);
                  }}
                  style={{
                    padding: '4px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600,
                    background: active ? 'rgba(108,99,255,0.2)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${active ? 'rgba(108,99,255,0.4)' : 'rgba(255,255,255,0.08)'}`,
                    color: active ? '#a78bfa' : '#555575',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Reviewer notes */}
        <div className="card" style={{ padding: '22px', gridColumn: '1 / -1' }}>
          <h2 className="section-title" style={{ marginBottom: '14px' }}>Reviewer Notes</h2>
          <textarea
            className="form-input form-textarea"
            style={{ minHeight: '80px' }}
            placeholder="Notes visible in the problem detail..."
            value={String(get('reviewNotes') ?? '')}
            onChange={e => set('reviewNotes', e.target.value)}
          />
          <div style={{ marginTop: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={Boolean(get('isConfidential'))}
                onChange={e => set('isConfidential', e.target.checked)}
                style={{ accentColor: '#ff6584', width: '15px', height: '15px' }}
              />
              <span style={{ fontSize: '0.85rem', color: '#c0c0e0' }}>Mark as Confidential (hide contact info)</span>
            </label>
          </div>
        </div>
      </div>

      {/* Bottom actions */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
        <Button variant="secondary" onClick={save} icon={<Save size={15} />}>Save Changes</Button>
        <Button variant="success" onClick={approve} icon={<CheckCircle2 size={15} />}>Approve</Button>
        <Button onClick={publish}>Approve & Publish</Button>
        <Button variant="danger" onClick={reject} icon={<XCircle size={15} />}>Reject</Button>
      </div>
    </div>
  );
}
