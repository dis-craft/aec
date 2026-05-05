'use client';
import React from 'react';
import { useProblems } from '../../context/ProblemsContext';

export function LoadingOverlay() {
  const { loading, error } = useProblems();

  if (error) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: '#08080f',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '16px',
      }}>
        <div style={{ fontSize: '2rem' }}>⚠️</div>
        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ff6584' }}>
          Database connection failed
        </div>
        <div style={{
          fontSize: '0.82rem', color: '#666688', maxWidth: '420px',
          textAlign: 'center', lineHeight: 1.6,
          background: 'rgba(255,101,132,0.08)',
          border: '1px solid rgba(255,101,132,0.2)',
          borderRadius: '10px', padding: '12px 16px',
        }}>
          {error}
        </div>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '8px 20px', borderRadius: '8px',
            background: 'rgba(108,99,255,0.15)',
            border: '1px solid rgba(108,99,255,0.3)',
            color: '#a78bfa', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!loading) return null;

  return (
    <div style={{
      position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
      display: 'flex', alignItems: 'center', gap: '10px',
      background: '#14142b',
      border: '1px solid rgba(108,99,255,0.3)',
      borderRadius: '10px', padding: '10px 16px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
    }}>
      <span style={{
        width: '14px', height: '14px',
        border: '2px solid #6c63ff', borderTopColor: 'transparent',
        borderRadius: '50%', animation: 'spin 0.7s linear infinite',
        display: 'inline-block', flexShrink: 0,
      }} />
      <span style={{ fontSize: '0.82rem', color: '#c0c0e0', fontWeight: 500 }}>
        Loading from database…
      </span>
    </div>
  );
}
