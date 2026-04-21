'use client';
import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

const CONFIG = {
  success: { icon: CheckCircle, color: '#43e97b', bg: 'rgba(67,233,123,0.12)' },
  error:   { icon: XCircle,     color: '#ff6584', bg: 'rgba(255,101,132,0.12)' },
  warning: { icon: AlertCircle, color: '#f9a825', bg: 'rgba(249,168,37,0.12)' },
  info:    { icon: Info,        color: '#60a5fa', bg: 'rgba(96,165,250,0.12)' },
};

let addToastGlobal: ((msg: string, type: ToastType) => void) | null = null;

export function toast(message: string, type: ToastType = 'info') {
  addToastGlobal?.(message, type);
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    addToastGlobal = (message, type) => {
      const id = Math.random().toString(36).slice(2);
      setToasts(prev => [...prev, { id, message, type }]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
    };
    return () => { addToastGlobal = null; };
  }, []);

  return (
    <div style={{
      position: 'fixed', bottom: '24px', right: '24px', zIndex: 2000,
      display: 'flex', flexDirection: 'column', gap: '10px',
    }}>
      {toasts.map(t => {
        const c = CONFIG[t.type];
        const IconComp = c.icon;
        return (
          <div key={t.id} style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            background: '#1a1a2e', border: `1px solid ${c.color}40`,
            borderLeft: `3px solid ${c.color}`,
            borderRadius: '12px', padding: '12px 16px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
            backdropFilter: 'blur(10px)',
            animation: 'slideInRight 0.3s ease',
            minWidth: '280px', maxWidth: '380px',
          }}>
            <IconComp size={18} color={c.color} />
            <span style={{ color: '#e0e0f0', fontSize: '0.87rem', flex: 1 }}>{t.message}</span>
            <button
              onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', padding: '2px' }}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
