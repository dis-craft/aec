import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  color?: string;
  bg?: string;
  size?: 'sm' | 'md';
  dot?: boolean;
}

export function Badge({ children, color = '#8888aa', bg = 'rgba(136,136,170,0.15)', size = 'md', dot = false }: BadgeProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        color,
        background: bg,
        border: `1px solid ${color}30`,
        borderRadius: '9999px',
        padding: size === 'sm' ? '2px 8px' : '3px 10px',
        fontSize: size === 'sm' ? '0.65rem' : '0.72rem',
        fontWeight: 600,
        letterSpacing: '0.02em',
        lineHeight: 1.6,
        whiteSpace: 'nowrap',
      }}
    >
      {dot && (
        <span style={{
          width: '6px', height: '6px', borderRadius: '50%',
          background: color, flexShrink: 0,
        }} />
      )}
      {children}
    </span>
  );
}
