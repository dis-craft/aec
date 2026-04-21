'use client';
import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';
import { UserRole } from '../../lib/types';
import { Shield, User, GraduationCap, Eye, ChevronDown, Bell } from 'lucide-react';

const ROLES: { value: UserRole; label: string; icon: React.FC<{ size?: number; color?: string }> }[] = [
  { value: 'admin',       label: 'Admin',       icon: Shield },
  { value: 'contributor', label: 'Contributor', icon: User },
  { value: 'student',     label: 'Student',     icon: GraduationCap },
  { value: 'reviewer',    label: 'Reviewer',    icon: Eye },
];

const ROLE_COLORS: Record<UserRole, string> = {
  admin:       '#ff6584',
  contributor: '#60a5fa',
  student:     '#43e97b',
  reviewer:    '#f9a825',
};

export function Navbar() {
  const { role, setRole } = useUser();
  const [open, setOpen] = useState(false);

  const current = ROLES.find(r => r.value === role)!;
  const CurrentIcon = current.icon;
  const color = ROLE_COLORS[role];

  return (
    <header style={{
      height: '64px',
      background: 'rgba(10,10,18,0.95)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      backdropFilter: 'blur(20px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: '0 24px',
      gap: '12px',
      position: 'sticky', top: 0, zIndex: 200,
    }}>

      {/* Notification bell */}
      <button style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '10px', padding: '8px',
        color: '#666688', cursor: 'pointer', display: 'flex',
        transition: 'all 0.2s',
      }}>
        <Bell size={18} />
      </button>

      {/* Role switcher */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setOpen(o => !o)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: `rgba(${color === '#ff6584' ? '255,101,132' : color === '#60a5fa' ? '96,165,250' : color === '#43e97b' ? '67,233,123' : '249,168,37'},0.1)`,
            border: `1px solid ${color}30`,
            borderRadius: '10px', padding: '7px 14px',
            color, cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
            transition: 'all 0.2s',
          }}
        >
          <CurrentIcon size={16} color={color} />
          <span>{current.label}</span>
          <ChevronDown size={14} style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }} />
        </button>

        {open && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 8px)', right: 0,
            background: '#16162a', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px', overflow: 'hidden', minWidth: '160px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
            zIndex: 300,
          }}>
            <div style={{ padding: '6px' }}>
              {ROLES.map(r => {
                const RIcon = r.icon;
                const rc = ROLE_COLORS[r.value];
                return (
                  <button
                    key={r.value}
                    onClick={() => { setRole(r.value); setOpen(false); }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '8px 12px', borderRadius: '8px',
                      background: role === r.value ? `${rc}18` : 'transparent',
                      border: 'none', cursor: 'pointer',
                      color: role === r.value ? rc : '#888899',
                      fontSize: '0.84rem', fontWeight: role === r.value ? 600 : 400,
                      transition: 'all 0.15s',
                    }}
                  >
                    <RIcon size={15} color={rc} />
                    {r.label}
                  </button>
                );
              })}
            </div>
            <div style={{
              padding: '8px 12px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              fontSize: '0.72rem', color: '#555566',
            }}>
              Switch role to change your view
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
