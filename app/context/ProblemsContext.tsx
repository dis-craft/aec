'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Problem, ProblemStatus } from '../lib/types';
import { getProblems, saveProblems } from '../lib/storage';
import { SAMPLE_PROBLEMS } from '../lib/sampleData';

interface ProblemsContextType {
  problems: Problem[];
  addProblem: (p: Problem) => void;
  updateProblem: (id: string, updates: Partial<Problem>) => void;
  deleteProblem: (id: string) => void;
  updateStatus: (id: string, status: ProblemStatus) => void;
  toggleSaved: (id: string) => void;
  getProblem: (id: string) => Problem | undefined;
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

const ProblemsContext = createContext<ProblemsContextType>({
  problems: [],
  addProblem: () => {},
  updateProblem: () => {},
  deleteProblem: () => {},
  updateStatus: () => {},
  toggleSaved: () => {},
  getProblem: () => undefined,
  stats: { total: 0, pending: 0, approved: 0, rejected: 0, selected: 0, solved: 0, published: 0 },
});

export function ProblemsProvider({ children }: { children: React.ReactNode }) {
  const [problems, setProblems] = useState<Problem[]>([]);

  useEffect(() => {
    const stored = getProblems();
    if (stored.length === 0) {
      // Seed with sample data on first load
      saveProblems(SAMPLE_PROBLEMS);
      setProblems(SAMPLE_PROBLEMS);
    } else {
      setProblems(stored);
    }
  }, []);

  const persist = useCallback((updated: Problem[]) => {
    setProblems(updated);
    saveProblems(updated);
  }, []);

  const addProblem = useCallback((p: Problem) => {
    setProblems(prev => {
      const updated = [p, ...prev];
      saveProblems(updated);
      return updated;
    });
  }, []);

  const updateProblem = useCallback((id: string, updates: Partial<Problem>) => {
    setProblems(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, ...updates } : p);
      saveProblems(updated);
      return updated;
    });
  }, []);

  const deleteProblem = useCallback((id: string) => {
    setProblems(prev => {
      const updated = prev.filter(p => p.id !== id);
      saveProblems(updated);
      return updated;
    });
  }, []);

  const updateStatus = useCallback((id: string, status: ProblemStatus) => {
    updateProblem(id, { status });
  }, [updateProblem]);

  const toggleSaved = useCallback((id: string) => {
    setProblems(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, isSaved: !p.isSaved } : p);
      saveProblems(updated);
      return updated;
    });
  }, []);

  const getProblem = useCallback((id: string) => {
    return problems.find(p => p.id === id);
  }, [problems]);

  const stats = {
    total: problems.length,
    pending: problems.filter(p => ['submitted', 'ai_extracted', 'under_review'].includes(p.status)).length,
    approved: problems.filter(p => ['approved', 'published'].includes(p.status)).length,
    rejected: problems.filter(p => p.status === 'archived').length,
    selected: problems.filter(p => ['selected', 'in_progress'].includes(p.status)).length,
    solved: problems.filter(p => p.status === 'solved').length,
    published: problems.filter(p => p.status === 'published').length,
  };

  return (
    <ProblemsContext.Provider value={{
      problems, addProblem, updateProblem, deleteProblem,
      updateStatus, toggleSaved, getProblem, stats
    }}>
      {children}
    </ProblemsContext.Provider>
  );
}

export function useProblems() {
  return useContext(ProblemsContext);
}
