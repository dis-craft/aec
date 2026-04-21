'use client';
import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useProblems } from '../../context/ProblemsContext';
import { useUser } from '../../context/UserContext';
import { runAIExtractionWithOllama } from '../../lib/aiExtractor';
import { ProblemSource } from '../../lib/types';
import { SOURCE_CONFIG } from '../../lib/constants';
import { Button } from '../../components/ui/Button';
import { toast } from '../../components/ui/Toast';
import { ArrowLeft, ArrowRight, Zap, CheckCircle2, Upload, Globe, Loader2 } from 'lucide-react';

/* ─── Types ──────────────────────────────────────────────────── */

type FieldType = 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'upload';

interface Field {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: string[];
  required?: boolean;
  hint?: string;
}

interface Step {
  title: string;
  subtitle: string;
  fields: Field[];
  /** Extra fields shown only for specific source types */
  conditionalFields?: Partial<Record<ProblemSource, Field[]>>;
}

/* ─── Unified 5-Step form config ─────────────────────────────── */

const STEPS: Step[] = [
  {
    title: 'Problem Summary',
    subtitle: 'Start with the basics — what is the problem and who does it affect?',
    fields: [
      {
        key: 'title',
        label: 'Problem Title',
        type: 'text',
        placeholder: 'A clear, concise title (e.g. "Manual attendance tracking wastes class time")',
        required: true,
      },
      {
        key: 'description',
        label: 'Describe the problem in 1–2 lines',
        type: 'textarea',
        placeholder: 'What exactly is happening? Keep it specific and factual.',
        required: true,
      },
      {
        key: 'location',
        label: 'Where does this problem occur?',
        type: 'text',
        placeholder: 'e.g. College campus, hospital OPD, rural village, e-commerce platform…',
        required: true,
      },
      {
        key: 'affected',
        label: 'Who is affected by this problem?',
        type: 'text',
        placeholder: 'e.g. Students, nurses, small farmers, delivery agents…',
        required: true,
      },
    ],
  },
  {
    title: 'Context & Impact',
    subtitle: 'Help us understand how often it happens and why it matters.',
    fields: [
      {
        key: 'frequency',
        label: 'How often does this problem happen?',
        type: 'radio',
        options: ['Multiple times a day', 'Daily', 'Weekly', 'Monthly', 'Seasonally'],
        required: true,
      },
      {
        key: 'cause',
        label: 'What causes this problem?',
        type: 'textarea',
        placeholder: 'Root cause — e.g. lack of automation, poor infrastructure, missing policy…',
        required: true,
      },
      {
        key: 'impact',
        label: 'What happens because of this problem?',
        type: 'textarea',
        placeholder: 'Effects on time, money, health, safety, or productivity…',
        required: true,
      },
      {
        key: 'importance',
        label: 'Why is this problem important to solve?',
        type: 'textarea',
        placeholder: 'What gets better for people if this is fixed?',
      },
    ],
  },
  {
    title: 'Constraints & Evidence',
    subtitle: 'What has been tried? What makes this problem hard to fix?',
    fields: [
      {
        key: 'prior_attempts',
        label: 'What has already been tried to solve it?',
        type: 'textarea',
        placeholder: 'Manual workarounds, previous tools, past projects… or "Nothing yet"',
      },
      {
        key: 'current_approach',
        label: 'What is currently being used to manage it?',
        type: 'text',
        placeholder: 'e.g. paper registers, Excel sheets, WhatsApp groups, manual phone calls…',
      },
      {
        key: 'constraints',
        label: 'What constraints exist?',
        type: 'textarea',
        placeholder: 'Budget limits, internet access, literacy level, legal restrictions…',
      },
      {
        key: 'data_available',
        label: 'What data, files, or evidence can be shared?',
        type: 'radio',
        options: ['Yes — photos, reports, or data files', 'Partial — some info available', 'No — nothing yet'],
      },
    ],
  },
  {
    title: 'Solution Expectation',
    subtitle: 'What kind of solution is needed, and is this suitable for student work?',
    fields: [
      {
        key: 'expected_solution',
        label: 'What kind of solution is expected?',
        type: 'select',
        options: [
          'Mobile / Web app',
          'Hardware / IoT device',
          'Process redesign',
          'Data analysis / Dashboard',
          'Awareness campaign',
          'Not sure — open to suggestions',
        ],
        required: true,
      },
      {
        key: 'success_looks_like',
        label: 'What should success look like if the problem is solved?',
        type: 'textarea',
        placeholder: 'e.g. "Attendance is marked in under 30 seconds with no manual effort"',
      },
      {
        key: 'student_suitable',
        label: 'Is this problem suitable for student work?',
        type: 'radio',
        options: ['Yes — fully', 'Yes — with guidance', 'Not sure', 'No'],
      },
      {
        key: 'publishable',
        label: 'Can this problem be shared publicly?',
        type: 'radio',
        options: ['Yes — share fully', 'Yes — but anonymize details', 'No — keep private'],
        required: true,
      },
    ],
  },
  {
    title: 'Source Details',
    subtitle: 'A few extra questions based on where you found this problem.',
    fields: [
      // Common upload + consent shown to all
      {
        key: 'files',
        label: 'Upload supporting files (optional)',
        type: 'upload',
        hint: 'Photos, reports, screenshots, spreadsheets — UI only for demo',
      },
      {
        key: 'consent',
        label: 'I confirm this information is accurate and I consent to it being reviewed by the ProblemX team',
        type: 'checkbox',
        required: true,
      },
    ],
    conditionalFields: {
      industry: [
        {
          key: 'department',
          label: 'Which department or workflow is affected?',
          type: 'text',
          placeholder: 'e.g. Procurement, Quality Control, Customer Support…',
        },
        {
          key: 'issue_type',
          label: 'Is the issue manual, technical, operational, or data-related?',
          type: 'select',
          options: ['Manual process', 'Technical / Software', 'Operational', 'Data & reporting', 'Mixed'],
        },
        {
          key: 'tools_used',
          label: 'What tools, software, or systems are currently used?',
          type: 'text',
          placeholder: 'Excel, SAP, Jira, custom software, none…',
        },
        {
          key: 'scale',
          label: 'What is the scale of the problem?',
          type: 'select',
          options: ['< 10 people', '10–50 people', '50–200 people', '200+ people', 'Company-wide'],
        },
        {
          key: 'urgency_deadline',
          label: 'Is there a deadline or urgency?',
          type: 'text',
          placeholder: 'e.g. Q3 deadline, regulatory requirement, immediate…',
        },
      ],
      ngo: [
        {
          key: 'community',
          label: 'Which community is affected?',
          type: 'text',
          placeholder: 'e.g. Tribal women, migrant workers, rural farmers…',
        },
        {
          key: 'spread',
          label: 'Is this issue local, regional, or widespread?',
          type: 'select',
          options: ['Local (1 village/ward)', 'District-wide', 'State-wide', 'National', 'International'],
        },
        {
          key: 'resource_limits',
          label: 'What are the main resource limitations?',
          type: 'textarea',
          placeholder: 'Budget, connectivity, transportation, language barriers…',
        },
        {
          key: 'social_impact',
          label: 'What social impact does this cause?',
          type: 'textarea',
          placeholder: 'How does this affect quality of life, safety, or dignity?',
        },
        {
          key: 'student_access',
          label: 'Can students directly observe or engage with the issue?',
          type: 'radio',
          options: ['Yes', 'Yes — with supervision', 'Limited', 'No'],
        },
      ],
      campus: [
        {
          key: 'department',
          label: 'Which department, block, or office is affected?',
          type: 'text',
          placeholder: 'e.g. CSE dept, hostel block B, exam cell, library…',
        },
        {
          key: 'process_type',
          label: 'Is the process currently manual or digital?',
          type: 'radio',
          options: ['Fully manual', 'Partially digital', 'Fully digital but broken'],
        },
        {
          key: 'bottleneck_location',
          label: 'Where is the delay or inefficiency happening?',
          type: 'text',
          placeholder: 'e.g. During registration, end of semester, daily attendance…',
        },
        {
          key: 'num_affected',
          label: 'How many people are affected?',
          type: 'select',
          options: ['< 50', '50–200', '200–500', '500–1000', '1000+'],
        },
        {
          key: 'campus_testable',
          label: 'Can a solution be tested inside campus?',
          type: 'radio',
          options: ['Yes', 'Partially', 'No'],
        },
      ],
      online: [
        {
          key: 'source_url',
          label: 'Source URL',
          type: 'text',
          placeholder: 'https://reddit.com/r/…',
        },
        {
          key: 'source_platform',
          label: 'What platform is this from?',
          type: 'select',
          options: ['Reddit', 'Quora', 'Twitter/X', 'HackerNews', 'ProductHunt', 'App Store Reviews', 'Forum / Blog', 'Other'],
        },
        {
          key: 'is_recurring_complaint',
          label: 'Is this a repeated complaint or a one-time issue?',
          type: 'radio',
          options: ['Repeated — many people complain', 'Occasional', 'One-time post'],
        },
        {
          key: 'pain_point',
          label: 'What exact pain point is being expressed?',
          type: 'textarea',
          placeholder: 'Paste the key sentence or quote from the post…',
        },
        {
          key: 'convert_to_formal',
          label: 'Should this be converted into a formal problem statement?',
          type: 'radio',
          options: ['Yes — it is clear enough', 'Needs more research first', 'Not sure'],
        },
      ],
      general: [
        {
          key: 'observed_when',
          label: 'When did you first notice this problem?',
          type: 'text',
          placeholder: 'Recently, over the past few months, long-standing issue…',
        },
        {
          key: 'personal_experience',
          label: 'Did you personally experience this or observe it happening to others?',
          type: 'radio',
          options: ['Personal experience', 'Observed it happening', 'Heard from others', 'Read/researched it'],
        },
      ],
    },
  },
];

/* ─── Reddit auto-fill component ─────────────────────────────── */

function RedditFetcher({ url, onFetched }: {
  url: string;
  onFetched: (fields: Record<string, string>) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fetched, setFetched] = useState(false);

  async function fetchReddit() {
    if (!url.trim()) { setError('Enter a Reddit URL first.'); return; }
    setLoading(true); setError(''); setFetched(false);
    try {
      const res = await fetch('/api/reddit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json() as Record<string, unknown>;
      if (!res.ok) { setError(String(data.error || `HTTP ${res.status}`)); return; }
      const content = [
        String(data.content || ''),
        data.top_comments ? `\n\nTop comments:\n${String(data.top_comments)}` : '',
      ].join('').trim();
      onFetched({
        title: String(data.title || ''),
        description: content.slice(0, 300),
        pain_point: content,
        source_platform: 'Reddit',
      });
      setFetched(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch');
    } finally { setLoading(false); }
  }

  return (
    <div style={{
      background: 'rgba(255,101,132,0.05)', border: '1px solid rgba(255,101,132,0.15)',
      borderRadius: '12px', padding: '14px 16px', marginBottom: '16px',
    }}>
      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#ff6584', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        🔗 Reddit Auto-Fill
      </div>
      <div style={{ fontSize: '0.8rem', color: '#888899', marginBottom: '10px' }}>
        Paste a Reddit URL in the source field below, then click to auto-populate title and content.
      </div>
      <button
        type="button"
        onClick={fetchReddit}
        disabled={loading}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '6px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600,
          background: fetched ? 'rgba(67,233,123,0.15)' : 'rgba(255,101,132,0.12)',
          border: `1px solid ${fetched ? 'rgba(67,233,123,0.3)' : 'rgba(255,101,132,0.3)'}`,
          color: fetched ? '#43e97b' : '#ff6584',
          cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
        }}
      >
        {loading
          ? <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Fetching…</>
          : fetched ? <><CheckCircle2 size={13} /> Auto-filled! Re-fetch</>
          : <><Globe size={13} /> Auto-fill from URL</>}
      </button>
      {error && <div style={{ fontSize: '0.73rem', color: '#ff6584', marginTop: '6px' }}>{error}</div>}
      {fetched && !error && <div style={{ fontSize: '0.73rem', color: '#43e97b', marginTop: '6px' }}>✓ Title and content filled from Reddit</div>}
    </div>
  );
}

/* ─── Progress bar ───────────────────────────────────────────── */

function ProgressBar({ steps, current }: { steps: Step[]; current: number }) {
  return (
    <div style={{ marginBottom: '28px' }}>
      <div style={{ display: 'flex', gap: '6px' }}>
        {steps.map((s, i) => (
          <div key={s.title} style={{ flex: 1 }}>
            <div style={{
              height: '3px', borderRadius: '999px',
              background: i < current
                ? 'linear-gradient(90deg, #6c63ff, #a855f7)'
                : i === current
                  ? 'linear-gradient(90deg, #a855f7, #a855f780)'
                  : 'rgba(255,255,255,0.07)',
              transition: 'background 0.3s ease',
            }} />
            <div style={{
              fontSize: '0.68rem', marginTop: '5px',
              color: i === current ? '#a78bfa' : i < current ? '#6c63ff' : '#555575',
              fontWeight: i === current ? 700 : 400,
            }}>{s.title}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: '0.75rem', color: '#555575', marginTop: '8px' }}>
        Step {current + 1} of {steps.length}
      </div>
    </div>
  );
}

/* ─── Single field renderer ──────────────────────────────────── */

function FormField({ field, value, onChange }: {
  field: Field;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="form-label">
        {field.label}
        {field.required && <span style={{ color: '#ff6584', marginLeft: '3px' }}>*</span>}
      </label>

      {field.type === 'text' && (
        <input className="form-input" placeholder={field.placeholder} value={value} onChange={e => onChange(e.target.value)} />
      )}
      {field.type === 'textarea' && (
        <textarea className="form-input form-textarea" placeholder={field.placeholder} value={value} onChange={e => onChange(e.target.value)} />
      )}
      {field.type === 'select' && (
        <select className="form-input form-select" value={value} onChange={e => onChange(e.target.value)}>
          <option value="">Select…</option>
          {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      )}
      {field.type === 'radio' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '2px' }}>
          {field.options?.map(o => (
            <label key={o} style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              padding: '7px 14px', borderRadius: '8px', cursor: 'pointer',
              background: value === o ? 'rgba(108,99,255,0.15)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${value === o ? 'rgba(108,99,255,0.4)' : 'rgba(255,255,255,0.07)'}`,
              transition: 'all 0.15s',
            }}>
              <input
                type="radio" name={field.key} value={o} checked={value === o} onChange={() => onChange(o)}
                style={{ accentColor: '#6c63ff', width: '14px', height: '14px' }}
              />
              <span style={{ fontSize: '0.82rem', color: value === o ? '#c4b5fd' : '#8888aa', fontWeight: value === o ? 600 : 400 }}>
                {o}
              </span>
            </label>
          ))}
        </div>
      )}
      {field.type === 'checkbox' && (
        <label style={{
          display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer',
          padding: '12px 14px', borderRadius: '10px',
          background: value === 'true' ? 'rgba(108,99,255,0.08)' : 'rgba(255,255,255,0.02)',
          border: `1px solid ${value === 'true' ? 'rgba(108,99,255,0.25)' : 'rgba(255,255,255,0.06)'}`,
          transition: 'all 0.2s',
        }}>
          <input
            type="checkbox" checked={value === 'true'}
            onChange={e => onChange(e.target.checked ? 'true' : '')}
            style={{ accentColor: '#6c63ff', width: '16px', height: '16px', marginTop: '2px', flexShrink: 0 }}
          />
          <span style={{ fontSize: '0.85rem', color: '#c0c0e0', lineHeight: 1.5 }}>{field.label}</span>
        </label>
      )}
      {field.type === 'upload' && (
        <div style={{
          border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '12px',
          padding: '28px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s',
          background: 'rgba(255,255,255,0.02)',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(108,99,255,0.4)'; e.currentTarget.style.background = 'rgba(108,99,255,0.04)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
        >
          <Upload size={22} color="#555575" style={{ marginBottom: '8px', display: 'block', margin: '0 auto 8px' }} />
          <div style={{ fontSize: '0.85rem', color: '#666688' }}>
            Drag & drop, or <span style={{ color: '#6c63ff' }}>browse</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#444455', marginTop: '4px' }}>PDF, images, CSV (preview only)</div>
        </div>
      )}

      {field.hint && (
        <div style={{ fontSize: '0.72rem', color: '#555575', marginTop: '4px' }}>{field.hint}</div>
      )}
    </div>
  );
}

/* ─── Main page ──────────────────────────────────────────────── */

export default function SubmitFormPage() {
  const params = useParams();
  const router = useRouter();
  const { addProblem, problems } = useProblems();
  const { userName } = useUser();

  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedId, setSubmittedId] = useState('');
  const [usedOllama, setUsedOllama] = useState(false);
  const [ollamaError, setOllamaError] = useState('');

  const source = params.formType as ProblemSource;
  const cfg = SOURCE_CONFIG[source];

  if (!cfg) {
    return (
      <div className="page" style={{ textAlign: 'center' }}>
        <p style={{ color: '#c0c0e0' }}>Unknown form type. <Link href="/submit" style={{ color: '#6c63ff' }}>Go back.</Link></p>
      </div>
    );
  }

  const currentStep = STEPS[step];

  // Merge base fields + conditional fields for this source on the last step
  const activeFields: Field[] =
    step === STEPS.length - 1
      ? [
          ...(currentStep.conditionalFields?.[source] ?? []),
          ...currentStep.fields, // upload + consent always at end
        ]
      : currentStep.fields;

  function setValue(key: string, val: string) {
    setValues(v => ({ ...v, [key]: val }));
  }

  function validateStep() {
    const required = activeFields.filter(f => f.required && f.type !== 'checkbox');
    const checkboxRequired = activeFields.filter(f => f.required && f.type === 'checkbox');

    const missingText = required.filter(f => !values[f.key]?.trim());
    const missingChecks = checkboxRequired.filter(f => values[f.key] !== 'true');

    if (missingText.length > 0) {
      toast(`Please fill in: ${missingText.map(f => f.label.slice(0, 40)).join(', ')}`, 'warning');
      return false;
    }
    if (missingChecks.length > 0) {
      toast('Please check the consent box to continue', 'warning');
      return false;
    }
    return true;
  }

  function next() {
    if (!validateStep()) return;
    if (step < STEPS.length - 1) setStep(s => s + 1);
    else handleSubmit();
  }

  function prev() { if (step > 0) setStep(s => s - 1); }

  async function handleSubmit() {
    if (!validateStep()) return;
    setSubmitting(true);

    const rawInput = { ...values };
    const { result: extracted, usedOllama: ollama, ollamaError: oErr } =
      await runAIExtractionWithOllama(rawInput, source, problems);

    const newProblem = {
      ...extracted,
      source,
      isConfidential: values.publishable === 'No — keep private',
      submittedBy: userName,
      rawInput,
      organizationName: values.organization,
      contactPerson: values.contact_person,
      location: values.location,
      sourceUrl: values.source_url,
    } as Parameters<typeof addProblem>[0];

    addProblem(newProblem);
    setSubmittedId(newProblem.id as string);
    setUsedOllama(ollama);
    setOllamaError(oErr || '');
    setSubmitting(false);
    setSubmitted(true);
    toast(
      ollama ? 'Submitted — extracted by Ollama AI ✨' : 'Submitted — extracted by keyword engine',
      'success'
    );
  }

  /* ── Success screen ── */
  if (submitted) {
    return (
      <div className="page" style={{ maxWidth: '560px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'rgba(67,233,123,0.15)', border: '2px solid rgba(67,233,123,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px', animation: 'pulse-glow 2s infinite',
        }}>
          <CheckCircle2 size={32} color="#43e97b" />
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f0f0ff', marginBottom: '10px' }}>Problem Submitted!</h1>
        <p style={{ color: '#8888aa', marginBottom: '16px', lineHeight: 1.6 }}>
          Your problem has been structured and queued for review.
        </p>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '8px 16px', borderRadius: '999px', marginBottom: '16px',
          background: usedOllama ? 'rgba(167,139,250,0.12)' : 'rgba(96,165,250,0.12)',
          border: `1px solid ${usedOllama ? 'rgba(167,139,250,0.3)' : 'rgba(96,165,250,0.3)'}`,
        }}>
          <span>{usedOllama ? '🤖' : '⚡'}</span>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: usedOllama ? '#a78bfa' : '#60a5fa' }}>
            {usedOllama ? 'Extracted by Ollama (phi)' : 'Extracted by keyword engine'}
          </span>
        </div>
        {!usedOllama && ollamaError && (
          <div style={{
            fontSize: '0.75rem', color: '#666688', marginBottom: '20px',
            padding: '8px 14px', background: 'rgba(255,255,255,0.03)',
            borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)',
          }}>
            Ollama offline: <span style={{ color: '#f9a825' }}>{ollamaError}</span>
            {ollamaError.toLowerCase().includes('not running') && (
              <span> — run <code style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 5px', borderRadius: '4px' }}>ollama run phi</code></span>
            )}
          </div>
        )}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button onClick={() => router.push(`/archive/${submittedId}`)} icon={<CheckCircle2 size={16} />}>
            View Problem
          </Button>
          <Button variant="secondary" onClick={() => { setSubmitted(false); setStep(0); setValues({}); }}>
            Submit Another
          </Button>
          <Button variant="ghost" onClick={() => router.push('/review')}>Go to Review</Button>
        </div>
      </div>
    );
  }

  /* ── Form ── */
  return (
    <div className="page">
      <Link href="/submit" style={{
        textDecoration: 'none', display: 'inline-flex', alignItems: 'center',
        gap: '6px', color: '#666688', fontSize: '0.83rem', marginBottom: '20px',
      }}>
        <ArrowLeft size={14} /> Back to form selector
      </Link>

      <div style={{ maxWidth: '680px' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <span style={{ fontSize: '1.4rem' }}>{cfg.icon}</span>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f0f0ff' }}>
              {cfg.label} — Problem Submission
            </h1>
          </div>
        </div>

        <ProgressBar steps={STEPS} current={step} />

        {/* Step card */}
        <div className="card" style={{ padding: '28px', marginBottom: '20px' }}>
          <div style={{ marginBottom: '22px' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#e0e0f8' }}>{currentStep.title}</h2>
            <p style={{ fontSize: '0.82rem', color: '#666688', marginTop: '3px' }}>{currentStep.subtitle}</p>
          </div>

          {/* Reddit auto-fill — only on last step for online source */}
          {source === 'online' && step === STEPS.length - 1 && (
            <RedditFetcher
              url={values.source_url || ''}
              onFetched={fields => setValues(v => ({ ...v, ...fields }))}
            />
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {activeFields.map(field => (
              <FormField
                key={field.key}
                field={field}
                value={values[field.key] || ''}
                onChange={v => setValue(field.key, v)}
              />
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {step > 0 && (
            <Button variant="secondary" onClick={prev} icon={<ArrowLeft size={15} />}>Previous</Button>
          )}
          <div style={{ flex: 1 }} />
          <Button
            onClick={next}
            loading={submitting}
            icon={step === STEPS.length - 1 ? <Zap size={15} /> : <ArrowRight size={15} />}
          >
            {submitting
              ? 'AI Extracting…'
              : step === STEPS.length - 1
                ? 'Submit & Extract'
                : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
}
