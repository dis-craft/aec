import { ProblemStatus, Difficulty, Urgency, Feasibility, ProblemSource } from './types';

export const DOMAINS = [
  'Healthcare', 'Education', 'Environment', 'Transport',
  'Agriculture', 'Finance', 'Technology', 'Civic & Governance',
  'Manufacturing', 'Retail', 'Energy', 'Social Impact',
  'Food & Nutrition', 'Housing', 'Safety & Security', 'Other',
];

export const TAGS = [
  'automation', 'data-driven', 'software', 'hardware',
  'process-improvement', 'iot', 'ai-ml', 'mobile',
  'web', 'analytics', 'communication', 'logistics',
  'monitoring', 'awareness', 'education', 'healthcare',
  'environment', 'campus', 'industry', 'ngo',
  'civic-issues', 'productivity', 'open-source',
];

export const REQUIRED_SKILLS = [
  'Python', 'JavaScript', 'Machine Learning', 'Data Analysis',
  'Web Development', 'Mobile Development', 'Embedded Systems',
  'UI/UX Design', 'Database Design', 'Cloud Computing',
  'IoT', 'Computer Vision', 'NLP', 'Blockchain', 'DevOps',
];

export const STATUS_CONFIG: Record<ProblemStatus, { label: string; color: string; bg: string }> = {
  draft:          { label: 'Draft',         color: '#8888aa', bg: 'rgba(136,136,170,0.15)' },
  submitted:      { label: 'Submitted',     color: '#60a5fa', bg: 'rgba(96,165,250,0.15)'  },
  ai_extracted:   { label: 'AI Extracted',  color: '#a78bfa', bg: 'rgba(167,139,250,0.15)' },
  under_review:   { label: 'Under Review',  color: '#f9a825', bg: 'rgba(249,168,37,0.15)'  },
  approved:       { label: 'Approved',      color: '#34d399', bg: 'rgba(52,211,153,0.15)'  },
  published:      { label: 'Published',     color: '#43e97b', bg: 'rgba(67,233,123,0.15)'  },
  selected:       { label: 'Selected',      color: '#f472b6', bg: 'rgba(244,114,182,0.15)' },
  in_progress:    { label: 'In Progress',   color: '#fb923c', bg: 'rgba(251,146,60,0.15)'  },
  solved:         { label: 'Solved',        color: '#4ade80', bg: 'rgba(74,222,128,0.15)'  },
  archived:       { label: 'Archived',      color: '#6b7280', bg: 'rgba(107,114,128,0.15)' },
};

export const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; color: string }> = {
  easy:     { label: 'Easy',     color: '#43e97b' },
  medium:   { label: 'Medium',   color: '#f9a825' },
  hard:     { label: 'Hard',     color: '#ff6584' },
  research: { label: 'Research', color: '#a78bfa' },
};

export const URGENCY_CONFIG: Record<Urgency, { label: string; color: string }> = {
  low:      { label: 'Low',      color: '#8888aa' },
  medium:   { label: 'Medium',   color: '#60a5fa' },
  high:     { label: 'High',     color: '#f9a825' },
  critical: { label: 'Critical', color: '#ff6584' },
};

export const FEASIBILITY_CONFIG: Record<Feasibility, { label: string; color: string }> = {
  low:    { label: 'Low',    color: '#ff6584' },
  medium: { label: 'Medium', color: '#f9a825' },
  high:   { label: 'High',   color: '#43e97b' },
};

export const SOURCE_CONFIG: Record<ProblemSource, { label: string; icon: string; color: string }> = {
  general:  { label: 'General',        icon: '📝', color: '#60a5fa' },
  industry: { label: 'Industry',       icon: '🏭', color: '#f9a825' },
  ngo:      { label: 'NGO / Social',   icon: '🤝', color: '#43e97b' },
  campus:   { label: 'Campus',         icon: '🎓', color: '#a78bfa' },
  online:   { label: 'Online Source',  icon: '🌐', color: '#ff6584' },
};

export const STATUS_ORDER: ProblemStatus[] = [
  'draft', 'submitted', 'ai_extracted', 'under_review',
  'approved', 'published', 'selected', 'in_progress', 'solved', 'archived',
];
