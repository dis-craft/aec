export type ProblemStatus =
  | 'draft'
  | 'submitted'
  | 'ai_extracted'
  | 'under_review'
  | 'approved'
  | 'published'
  | 'selected'
  | 'in_progress'
  | 'solved'
  | 'archived';

export type ProblemSource = 'general' | 'industry' | 'ngo' | 'campus' | 'online';

export type Difficulty = 'easy' | 'medium' | 'hard' | 'research';

export type Urgency = 'low' | 'medium' | 'high' | 'critical';

export type Feasibility = 'low' | 'medium' | 'high';

export type UserRole = 'admin' | 'contributor' | 'student' | 'reviewer';

export interface Problem {
  id: string;
  title: string;
  description: string;
  shortSummary: string;
  source: ProblemSource;
  domain: string;
  tags: string[];
  difficulty: Difficulty;
  urgency: Urgency;
  status: ProblemStatus;
  affectedStakeholders: string;
  cause: string;
  impact: string;
  frequency: string;
  feasibility: Feasibility;
  requiredSkills: string[];
  requiredResources: string[];
  confidenceScore: number;
  isConfidential: boolean;
  submittedBy: string;
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  selectedBy?: string;
  selectedAt?: string;
  organizationName?: string;
  contactPerson?: string;
  location?: string;
  sourceUrl?: string;
  rawInput: Record<string, string>;
  aiExtracted: boolean;
  duplicateWarning: boolean;
  isSaved?: boolean;
}

export interface StudentSelection {
  id: string;
  problemId: string;
  studentName: string;
  teamName: string;
  reason: string;
  solutionDirection: string;
  resourcesNeeded: string;
  mentorSupport: boolean;
  timeline: string;
  deliverable: string;
  teamRoles: string;
  createdAt: string;
}

export interface ReviewAction {
  id: string;
  problemId: string;
  action: 'approved' | 'rejected' | 'requested_details' | 'edited';
  reviewer: string;
  notes: string;
  timestamp: string;
}
