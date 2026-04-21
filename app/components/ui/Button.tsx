import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  loading?: boolean;
}

const VARIANTS = {
  primary: {
    background: 'linear-gradient(135deg, #6c63ff, #a855f7)',
    color: '#fff',
    border: 'none',
    boxShadow: '0 4px 15px rgba(108,99,255,0.35)',
  },
  secondary: {
    background: 'rgba(255,255,255,0.06)',
    color: '#c8c8e8',
    border: '1px solid rgba(255,255,255,0.1)',
    boxShadow: 'none',
  },
  ghost: {
    background: 'transparent',
    color: '#8888aa',
    border: '1px solid transparent',
    boxShadow: 'none',
  },
  danger: {
    background: 'rgba(255,101,132,0.15)',
    color: '#ff6584',
    border: '1px solid rgba(255,101,132,0.3)',
    boxShadow: 'none',
  },
  success: {
    background: 'rgba(67,233,123,0.15)',
    color: '#43e97b',
    border: '1px solid rgba(67,233,123,0.3)',
    boxShadow: 'none',
  },
};

const SIZES = {
  sm: { padding: '6px 14px', fontSize: '0.78rem', borderRadius: '8px' },
  md: { padding: '9px 20px', fontSize: '0.875rem', borderRadius: '10px' },
  lg: { padding: '12px 28px', fontSize: '0.95rem', borderRadius: '12px' },
};

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  children,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const v = VARIANTS[variant];
  const s = SIZES[size];
  return (
    <button
      disabled={disabled || loading}
      style={{
        ...v,
        ...s,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontWeight: 600,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.2s ease',
        fontFamily: 'inherit',
        ...style,
      }}
      {...props}
    >
      {loading ? (
        <span style={{
          width: '14px', height: '14px', border: '2px solid currentColor',
          borderTopColor: 'transparent', borderRadius: '50%',
          animation: 'spin 0.7s linear infinite', display: 'inline-block',
        }} />
      ) : icon}
      {children}
    </button>
  );
}
