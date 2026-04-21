'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = 'Search problems…' }: SearchBarProps) {
  return (
    <div style={{ position: 'relative', flex: 1 }}>
      <Search size={16} color="#555575" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
      <input
        className="form-input"
        style={{ paddingLeft: '38px', paddingRight: '38px' }}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          style={{
            position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer', color: '#555575', padding: '2px',
          }}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
