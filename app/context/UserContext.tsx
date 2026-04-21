'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserRole } from '../lib/types';

interface UserContextType {
  role: UserRole;
  setRole: (r: UserRole) => void;
  userName: string;
}

const UserContext = createContext<UserContextType>({
  role: 'student',
  setRole: () => {},
  userName: 'Demo User',
});

const ROLE_NAMES: Record<UserRole, string> = {
  admin: 'Admin',
  contributor: 'Contributor',
  student: 'Student',
  reviewer: 'Reviewer',
};

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<UserRole>('student');

  useEffect(() => {
    const saved = localStorage.getItem('problemx_role') as UserRole | null;
    if (saved) setRoleState(saved);
  }, []);

  const setRole = useCallback((r: UserRole) => {
    setRoleState(r);
    localStorage.setItem('problemx_role', r);
  }, []);

  return (
    <UserContext.Provider value={{ role, setRole, userName: ROLE_NAMES[role] }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
