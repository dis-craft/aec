'use client';

import React, {
  createContext, useContext, useState, useEffect, useCallback, useRef,
} from 'react';
import { Problem, ProblemStatus } from '../lib/types';
import { generateId } from '../lib/storage';

/* ─── Context shape ──────────────────────────────────────────── */

interface ProblemsContextType {
  problems: Problem[];
  loading: boolean;
  error: string | null;
  addProblem: (p: Problem) => Promise<void>;
  updateProblem: (id: string, updates: Partial<Problem>) => Promise<void>;
  deleteProblem: (id: string) => Promise<void>;
  updateStatus: (id: string, status: ProblemStatus) => Promise<void>;
  toggleSaved: (id: string) => Promise<void>;
  getProblem: (id: string) => Problem | undefined;
  refetch: () => Promise<void>;
  stats: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    selected: number;
    solved: number;
    published: number;
  };
}

/* ─── Defaults ───────────────────────────────────────────────── */

const noop = async () => {};

const ProblemsContext = createContext<ProblemsContextType>({
  problems: [],
  loading: true,
  error: null,
  addProblem: noop,
  updateProblem: noop,
  deleteProblem: noop,
  updateStatus: noop,
  toggleSaved: noop,
  getProblem: () => undefined,
  refetch: noop,
  stats: { total: 0, pending: 0, approved: 0, rejected: 0, selected: 0, solved: 0, published: 0 },
});

/* ─── API helpers ────────────────────────────────────────────── */

async function apiGet(): Promise<Problem[]> {
  const res = await fetch('/api/problems', { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to load problems: ${res.status}`);
  return res.json();
}

async function apiPost(problem: Problem): Promise<void> {
  const res = await fetch('/api/problems', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(problem),
  });
  if (!res.ok) throw new Error(`Failed to save problem: ${res.status}`);
}

async function apiPatch(id: string, updates: Partial<Problem>): Promise<void> {
  const res = await fetch(`/api/problems/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error(`Failed to update problem ${id}: ${res.status}`);
}

async function apiDelete(id: string): Promise<void> {
  const res = await fetch(`/api/problems/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`Failed to delete problem ${id}: ${res.status}`);
}

/* ─── Provider ───────────────────────────────────────────────── */

export function ProblemsProvider({ children }: { children: React.ReactNode }) {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initialized = useRef(false);

  /* Initialize DB + fetch on mount */
  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiGet();
      setProblems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load problems');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    (async () => {
      try {
        // Ensure table exists + seed sample data on first run
        await fetch('/api/init', { method: 'POST' });
      } catch {
        // Non-fatal — table may already exist
      }
      await refetch();
    })();
  }, [refetch]);

  /* addProblem — optimistic */
  const addProblem = useCallback(async (p: Problem) => {
    const withId: Problem = { ...p, id: p.id || generateId() };
    setProblems(prev => [withId, ...prev]);          // optimistic
    try {
      await apiPost(withId);
    } catch (err) {
      // Rollback
      setProblems(prev => prev.filter(x => x.id !== withId.id));
      setError(err instanceof Error ? err.message : 'Failed to save');
    }
  }, []);

  /* updateProblem — optimistic */
  const updateProblem = useCallback(async (id: string, updates: Partial<Problem>) => {
    setProblems(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p)); // optimistic
    try {
      await apiPatch(id, updates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update');
      await refetch(); // Restore to DB truth on failure
    }
  }, [refetch]);

  /* deleteProblem — optimistic */
  const deleteProblem = useCallback(async (id: string) => {
    const snapshot = problems.find(p => p.id === id);
    setProblems(prev => prev.filter(p => p.id !== id));  // optimistic
    try {
      await apiDelete(id);
    } catch (err) {
      if (snapshot) setProblems(prev => [snapshot, ...prev]); // rollback
      setError(err instanceof Error ? err.message : 'Failed to delete');
    }
  }, [problems]);

  const updateStatus = useCallback(
    (id: string, status: ProblemStatus) => updateProblem(id, { status }),
    [updateProblem]
  );

  const toggleSaved = useCallback(
    async (id: string) => {
      const current = problems.find(p => p.id === id);
      if (!current) return;
      await updateProblem(id, { isSaved: !current.isSaved });
    },
    [problems, updateProblem]
  );

  const getProblem = useCallback(
    (id: string) => problems.find(p => p.id === id),
    [problems]
  );

  const stats = {
    total: problems.length,
    pending: problems.filter(p =>
      ['submitted', 'ai_extracted', 'under_review'].includes(p.status)
    ).length,
    approved: problems.filter(p =>
      ['approved', 'published'].includes(p.status)
    ).length,
    rejected: problems.filter(p => p.status === 'archived').length,
    selected: problems.filter(p =>
      ['selected', 'in_progress'].includes(p.status)
    ).length,
    solved: problems.filter(p => p.status === 'solved').length,
    published: problems.filter(p => p.status === 'published').length,
  };

  return (
    <ProblemsContext.Provider value={{
      problems, loading, error,
      addProblem, updateProblem, deleteProblem,
      updateStatus, toggleSaved, getProblem, refetch, stats,
    }}>
      {children}
    </ProblemsContext.Provider>
  );
}

export function useProblems() {
  return useContext(ProblemsContext);
}
