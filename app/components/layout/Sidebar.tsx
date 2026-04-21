'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Archive, PlusCircle, ClipboardCheck,
  GraduationCap, BarChart3, ChevronLeft, ChevronRight,
  Zap, Rss
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/submit',    icon: PlusCircle,       label: 'Submit Problem' },
  { href: '/archive',   icon: Archive,           label: 'Problem Archive' },
  { href: '/reddit',    icon: Rss,               label: 'Reddit Discovery', accent: '#ff6584' },
  { href: '/review',    icon: ClipboardCheck,    label: 'Review Panel' },
  { href: '/student',   icon: GraduationCap,     label: 'Student Space' },
  { href: '/analytics', icon: BarChart3,          label: 'Analytics' },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside style={{
      width: collapsed ? '64px' : '220px',
      minHeight: '100vh',
      background: '#0e0e1f',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
      flexShrink: 0,
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{
        padding: collapsed ? '20px 0' : '20px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'flex-start',
        gap: '10px',
        minHeight: '64px',
      }}>
        <div style={{
          width: 34, height: 34, borderRadius: '10px',
          background: 'linear-gradient(135deg, #6c63ff, #a855f7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 4px 15px rgba(108,99,255,0.4)',
        }}>
          <Zap size={18} color="#fff" strokeWidth={2.5} />
        </div>
        {!collapsed && (
          <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#f0f0ff', letterSpacing: '-0.02em' }}>
            Problem<span style={{ color: '#6c63ff' }}>X</span>
          </span>
        )}
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {NAV_ITEMS.map(({ href, icon: Icon, label, accent }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          const activeColor = accent || '#a78bfa';
          const activeBg = accent ? `${accent}18` : 'rgba(108,99,255,0.18)';
          const activeBorder = accent ? `${accent}30` : 'rgba(108,99,255,0.3)';
          return (
            <Link key={href} href={href} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: collapsed ? '10px 0' : '10px 12px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: '10px',
                background: active ? activeBg : 'transparent',
                border: `1px solid ${active ? activeBorder : 'transparent'}`,
                transition: 'all 0.2s ease',
                cursor: 'pointer',
              }}
                className="sidebar-item"
              >
                <Icon size={18} color={active ? activeColor : '#666688'} strokeWidth={2} />
                {!collapsed && (
                  <span style={{
                    fontSize: '0.84rem',
                    fontWeight: active ? 600 : 500,
                    color: active ? activeColor : '#778899',
                    whiteSpace: 'nowrap',
                  }}>
                    {label}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button
          onClick={() => setCollapsed(c => !c)}
          style={{
            width: '100%',
            display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start',
            gap: '8px',
            padding: '8px 12px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '10px',
            color: '#666688',
            cursor: 'pointer',
            fontSize: '0.8rem',
            transition: 'all 0.2s',
          }}
        >
          {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /><span>Collapse</span></>}
        </button>
      </div>
    </aside>
  );
}
