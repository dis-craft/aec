import { Problem, ProblemSource, Difficulty, Urgency, Feasibility } from './types';
import { DOMAINS, TAGS, REQUIRED_SKILLS } from './constants';
import { generateId } from './storage';

const DOMAIN_KEYWORDS: Record<string, string[]> = {
  Healthcare:         ['health', 'hospital', 'medical', 'patient', 'doctor', 'clinic', 'medicine', 'disease', 'care', 'nurse'],
  Education:          ['school', 'student', 'teacher', 'learning', 'class', 'university', 'college', 'education', 'course', 'study'],
  Environment:        ['pollution', 'waste', 'climate', 'environment', 'water', 'air', 'green', 'energy', 'carbon', 'recycle'],
  Transport:          ['traffic', 'transport', 'road', 'bus', 'vehicle', 'commute', 'parking', 'route', 'logistics', 'delivery'],
  Agriculture:        ['farm', 'crop', 'agriculture', 'food', 'soil', 'harvest', 'irrigation', 'livestock', 'fertilizer', 'pest'],
  Finance:            ['bank', 'payment', 'finance', 'money', 'loan', 'credit', 'insurance', 'tax', 'budget', 'expense'],
  Technology:         ['software', 'app', 'system', 'data', 'digital', 'automation', 'iot', 'ai', 'tech', 'platform'],
  'Civic & Governance': ['government', 'civic', 'public', 'city', 'municipal', 'citizen', 'policy', 'service', 'official', 'ward'],
  Manufacturing:      ['factory', 'production', 'manufacturing', 'supply', 'quality', 'machine', 'inventory', 'assembly', 'defect', 'process'],
  'Social Impact':    ['community', 'social', 'poverty', 'women', 'disability', 'ngo', 'welfare', 'support', 'access', 'inclusive'],
};

const SKILL_KEYWORDS: Record<string, string[]> = {
  'Python':             ['python', 'data', 'ml', 'analysis', 'script'],
  'Machine Learning':   ['ai', 'machine learning', 'prediction', 'model', 'intelligent'],
  'Web Development':    ['web', 'website', 'portal', 'dashboard', 'online'],
  'Mobile Development': ['mobile', 'app', 'phone', 'android', 'ios'],
  'Data Analysis':      ['data', 'analytics', 'statistics', 'report', 'insight'],
  'UI/UX Design':       ['design', 'interface', 'user experience', 'prototype', 'wireframe'],
  'Database Design':    ['database', 'storage', 'records', 'management', 'tracking'],
  'IoT':                ['sensor', 'hardware', 'embedded', 'iot', 'device'],
};

function detectDomain(text: string): string {
  const lower = text.toLowerCase();
  let best = 'Technology';
  let bestScore = 0;
  for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
    const score = keywords.filter(k => lower.includes(k)).length;
    if (score > bestScore) { bestScore = score; best = domain; }
  }
  return best;
}

function detectTags(text: string, domain: string): string[] {
  const lower = text.toLowerCase();
  const found: string[] = [];
  if (lower.includes('automat')) found.push('automation');
  if (lower.includes('data') || lower.includes('analytic')) found.push('data-driven');
  if (lower.includes('software') || lower.includes('app') || lower.includes('web')) found.push('software');
  if (lower.includes('hardware') || lower.includes('sensor') || lower.includes('device')) found.push('hardware');
  if (lower.includes('campus') || lower.includes('college') || lower.includes('university')) found.push('campus');
  if (lower.includes('ngo') || lower.includes('community') || lower.includes('social')) found.push('ngo');
  if (lower.includes('repeat') || lower.includes('recurring') || lower.includes('frequent')) found.push('process-improvement');
  if (lower.includes('mobile') || lower.includes('phone')) found.push('mobile');
  if (domain === 'Healthcare') found.push('healthcare');
  if (domain === 'Education') found.push('education');
  if (domain === 'Environment') found.push('environment');
  if (domain === 'Transport') found.push('logistics');
  const validTags = TAGS.filter(t => found.includes(t));
  return [...new Set(validTags)].slice(0, 5);
}

function detectDifficulty(text: string, source: ProblemSource): Difficulty {
  const lower = text.toLowerCase();
  if (lower.includes('research') || lower.includes('complex') || lower.includes('innovation')) return 'research';
  if (lower.includes('difficult') || lower.includes('major') || lower.includes('critical') || source === 'industry') return 'hard';
  if (lower.includes('medium') || lower.includes('moderate') || source === 'ngo') return 'medium';
  return 'easy';
}

function detectUrgency(text: string): Urgency {
  const lower = text.toLowerCase();
  if (lower.includes('urgent') || lower.includes('critical') || lower.includes('emergency') || lower.includes('immediately')) return 'critical';
  if (lower.includes('important') || lower.includes('significant') || lower.includes('major')) return 'high';
  if (lower.includes('moderate') || lower.includes('average')) return 'medium';
  return 'low';
}

function detectFeasibility(text: string): Feasibility {
  const lower = text.toLowerCase();
  if (lower.includes('simple') || lower.includes('easy') || lower.includes('straightforward') || lower.includes('quick')) return 'high';
  if (lower.includes('complex') || lower.includes('difficult') || lower.includes('research') || lower.includes('hardware')) return 'low';
  return 'medium';
}

function detectSkills(text: string, domain: string): string[] {
  const lower = text.toLowerCase();
  const found: string[] = [];
  for (const [skill, keywords] of Object.entries(SKILL_KEYWORDS)) {
    if (keywords.some(k => lower.includes(k))) found.push(skill);
  }
  if (found.length === 0) {
    // fallback by domain
    const domainSkills: Record<string, string[]> = {
      Healthcare: ['Python', 'Data Analysis', 'Web Development'],
      Education: ['Web Development', 'Mobile Development', 'Database Design'],
      Environment: ['Data Analysis', 'IoT', 'Python'],
      Technology: ['Web Development', 'Python', 'Data Analysis'],
    };
    return (domainSkills[domain] || ['Web Development', 'Data Analysis']).slice(0, 3);
  }
  return [...new Set(found)].slice(0, 4);
}

function generateSummary(title: string, description: string, domain: string): string {
  const truncated = description.length > 120 ? description.slice(0, 120) + '...' : description;
  return `A ${domain.toLowerCase()} problem: ${truncated}`;
}

function computeConfidence(rawInput: Record<string, string>): number {
  const filled = Object.values(rawInput).filter(v => v && v.trim().length > 10).length;
  const total = Object.keys(rawInput).length;
  const ratio = total > 0 ? filled / total : 0;
  // Base 50 + up to 40 from field completeness + up to 10 random variance
  return Math.min(98, Math.round(50 + ratio * 40 + Math.random() * 8));
}

export function runAIExtraction(
  rawInput: Record<string, string>,
  source: ProblemSource,
  existingProblems: Problem[]
): Partial<Problem> {
  const allText = Object.values(rawInput).join(' ');
  const title = rawInput.title || rawInput.problem_title || rawInput.post_title || 'Untitled Problem';
  const description = rawInput.description || rawInput.problem_description || rawInput.detailed_problem || rawInput.post_content || allText;

  const domain = detectDomain(allText);
  const tags = detectTags(allText, domain);
  const difficulty = detectDifficulty(allText, source);
  const urgency = detectUrgency(allText);
  const feasibility = detectFeasibility(allText)
  const requiredSkills = detectSkills(allText, domain);
  const confidenceScore = computeConfidence(rawInput);
  const shortSummary = generateSummary(title, description, domain);

  const duplicateWarning = existingProblems.some(p => {
    if (p.title === title) return true;
    const common = title.toLowerCase().split(' ').filter(w => w.length > 4 && p.title.toLowerCase().includes(w));
    return common.length >= 2;
  });

  const cause = rawInput.cause || rawInput.bottleneck || rawInput.main_difficulty || 'Not specified';
  const impact = rawInput.impact || rawInput.expected_impact || rawInput.social_impact || 'Not specified';
  const affectedStakeholders = rawInput.affected || rawInput.who_affected || rawInput.community || 'General public';
  const frequency = rawInput.frequency || rawInput.how_often || (rawInput.recurring === 'yes' ? 'Recurring' : 'Unknown');

  return {
    id: generateId(),
    title,
    description,
    shortSummary,
    domain,
    tags,
    difficulty,
    urgency,
    feasibility,
    requiredSkills,
    requiredResources: ['Internet access', 'Development tools'],
    confidenceScore,
    aiExtracted: true,
    duplicateWarning,
    cause,
    impact,
    affectedStakeholders,
    frequency,
    status: 'ai_extracted',
    submittedAt: new Date().toISOString(),
  };
}

/* ─── Ollama-backed async extractor ──────────────────────────
   Calls /api/extract which proxies to localhost:11434.
   Returns { result, usedOllama } so the caller knows which path ran.
   Falls back to the sync keyword extractor on any failure.
─────────────────────────────────────────────────────────────── */

interface OllamaExtractionResult {
  result: Partial<Problem>;
  usedOllama: boolean;
  ollamaError?: string;
}

export async function runAIExtractionWithOllama(
  rawInput: Record<string, string>,
  source: ProblemSource,
  existingProblems: Problem[]
): Promise<OllamaExtractionResult> {
  const allText = Object.values(rawInput).join(' ').trim();

  try {
    const res = await fetch('/api/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: allText }),
    });

    if (res.status === 503) {
      // Ollama not running — fall back silently
      const fallback = runAIExtraction(rawInput, source, existingProblems);
      return { result: fallback, usedOllama: false, ollamaError: 'Ollama is not running' };
    }

    if (!res.ok) {
      const errData = await res.json().catch(() => ({})) as Record<string, string>;
      const fallback = runAIExtraction(rawInput, source, existingProblems);
      return { result: fallback, usedOllama: false, ollamaError: errData.error || `HTTP ${res.status}` };
    }

    const data = await res.json() as { parsed: Record<string, unknown> | null; raw?: string; error?: string };

    if (!data.parsed) {
      // API route could not parse JSON from Ollama — fall back
      const fallback = runAIExtraction(rawInput, source, existingProblems);
      return { result: fallback, usedOllama: false, ollamaError: 'AI returned unparseable output' };
    }

    const p = data.parsed;

    // Validate enum values — use LLM output if valid, else keyword detection
    const title = String(p.title || rawInput.title || 'Untitled Problem');
    const description = String(p.problem_statement || rawInput.description || allText);
    const shortSummary = String(p.short_summary || generateSummary(title, description, String(p.domain || 'Technology')));
    const domain = DOMAINS.includes(String(p.domain)) ? String(p.domain) : detectDomain(allText);
    const rawTags = Array.isArray(p.tags) ? (p.tags as string[]).filter(t => TAGS.includes(t)) : [];
    const tags = rawTags.length > 0 ? rawTags : detectTags(allText, domain);
    const difficulty: Difficulty = (['easy', 'medium', 'hard', 'research'] as const).includes(String(p.difficulty) as Difficulty)
      ? String(p.difficulty) as Difficulty
      : detectDifficulty(allText, source);
    const urgency: Urgency = (['low', 'medium', 'high', 'critical'] as const).includes(String(p.urgency) as Urgency)
      ? String(p.urgency) as Urgency
      : detectUrgency(allText);
    const feasibility: Feasibility = (['low', 'medium', 'high'] as const).includes(String(p.feasibility) as Feasibility)
      ? String(p.feasibility) as Feasibility
      : detectFeasibility(allText);
    const rawSkills = Array.isArray(p.required_skills) ? p.required_skills as string[] : [];
    const requiredSkills = rawSkills.length > 0 ? rawSkills.slice(0, 5) : detectSkills(allText, domain);
    const confidenceScore = typeof p.confidence_score === 'number'
      ? Math.min(98, Math.max(40, Math.round(p.confidence_score)))
      : computeConfidence(rawInput);

    const duplicateWarning = existingProblems.some(existing => {
      if (existing.title === title) return true;
      const common = title.toLowerCase().split(' ').filter(w => w.length > 4 && existing.title.toLowerCase().includes(w));
      return common.length >= 2;
    });

    const built: Partial<Problem> = {
      id: generateId(),
      title,
      description,
      shortSummary,
      domain,
      tags,
      difficulty,
      urgency,
      feasibility,
      requiredSkills,
      requiredResources: ['Internet access', 'Development tools'],
      confidenceScore,
      aiExtracted: true,
      duplicateWarning,
      cause: String(p.cause || rawInput.cause || 'Not specified'),
      impact: String(p.impact || rawInput.impact || 'Not specified'),
      affectedStakeholders: String(p.who_affected || rawInput.affected || 'General public'),
      frequency: String(p.frequency || rawInput.frequency || 'Unknown'),
      status: 'ai_extracted',
      submittedAt: new Date().toISOString(),
    };

    return { result: built, usedOllama: true };

  } catch (err) {
    // Network error, timeout, etc.
    const fallback = runAIExtraction(rawInput, source, existingProblems);
    return {
      result: fallback,
      usedOllama: false,
      ollamaError: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

