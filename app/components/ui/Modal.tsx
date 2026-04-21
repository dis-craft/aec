'use client';
import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  width?: number;
}

export function Modal({ open, onClose, title, children, width = 560 }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: '#16162a',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px',
        width: '100%',
        maxWidth: width,
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
        animation: 'modalIn 0.2s ease',
      }}>
        {title && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '20px 24px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f0f0ff', margin: 0 }}>{title}</h2>
            <button onClick={onClose} style={{
              background: 'rgba(255,255,255,0.06)', border: 'none', cursor: 'pointer',
              color: '#8888aa', borderRadius: '8px', padding: '6px', display: 'flex',
              transition: 'color 0.2s',
            }}>
              <X size={18} />
            </button>
          </div>
        )}
        <div style={{ padding: '24px' }}>{children}</div>
      </div>
    </div>
  );
}
