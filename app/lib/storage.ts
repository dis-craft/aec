import { Problem, StudentSelection } from './types';

const PROBLEMS_KEY = 'problemx_problems';
const SELECTIONS_KEY = 'problemx_selections';

export function getProblems(): Problem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(PROBLEMS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveProblems(problems: Problem[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PROBLEMS_KEY, JSON.stringify(problems));
}

export function getSelections(): StudentSelection[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SELECTIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSelections(selections: StudentSelection[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SELECTIONS_KEY, JSON.stringify(selections));
}

export function generateId(): string {
  return `px_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
