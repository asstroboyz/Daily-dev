'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { WorkLogModal } from '@/features/work-logs/WorkLogModal';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { href: '/tasks', label: 'Tasks', icon: 'checklist' },
  { href: '/branches', label: 'Branches', icon: 'fork_right' },
  { href: '/projects', label: 'Projects', icon: 'folder_open' },
  { href: '/reports/daily', label: 'Daily Report', icon: 'summarize' },
];

export function Sidebar() {
  const pathname = usePathname();
  const [workLogOpen, setWorkLogOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const NavContent = (
    <div className="flex flex-col h-full" style={{ background: 'var(--surface-container-lowest)', borderRight: '1px solid var(--outline-variant)' }}>
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded flex items-center justify-center" style={{ background: 'var(--primary)' }}>
          <span className="material-symbols-outlined text-sm" style={{ color: 'var(--on-primary)', fontSize: '18px' }}>terminal</span>
        </div>
        <span style={{ fontFamily: 'Geist', fontWeight: 600, fontSize: '18px', color: 'var(--on-surface)', letterSpacing: '-0.01em' }}>
          DevLog
        </span>
        {mobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto p-1 rounded"
            style={{ color: 'var(--on-surface-variant)' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map(({ href, label, icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors"
              style={{
                background: active ? 'var(--secondary-container)' : 'transparent',
                color: active ? 'var(--on-secondary-container)' : 'var(--on-surface-variant)',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = 'var(--surface-container-high)';
                  (e.currentTarget as HTMLElement).style.color = 'var(--on-surface)';
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = 'var(--on-surface-variant)';
                }
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>{icon}</span>
              <span style={{ fontFamily: 'Geist', fontSize: '14px', fontWeight: 400 }}>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Settings Footer */}
      <div className="px-3 pb-6 pt-4" style={{ borderTop: '1px solid var(--outline-variant)' }}>
        <Link
          href="/settings"
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
          style={{
            background: pathname === '/settings' ? 'var(--secondary-container)' : 'transparent',
            color: pathname === '/settings' ? 'var(--on-secondary-container)' : 'var(--on-surface-variant)',
          }}
          onMouseEnter={(e) => {
            if (pathname !== '/settings') {
              (e.currentTarget as HTMLElement).style.background = 'var(--surface-container-high)';
              (e.currentTarget as HTMLElement).style.color = 'var(--on-surface)';
            }
          }}
          onMouseLeave={(e) => {
            if (pathname !== '/settings') {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
              (e.currentTarget as HTMLElement).style.color = 'var(--on-surface-variant)';
            }
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>settings</span>
          <span style={{ fontFamily: 'Geist', fontSize: '14px' }}>Settings</span>
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 h-full hidden lg:flex flex-col z-50" style={{ width: '240px' }}>
        {NavContent}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative animate-slide-up" style={{ width: '240px', height: '100%', zIndex: 10 }}>
            {NavContent}
          </div>
        </div>
      )}

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 lg:hidden flex items-center justify-around z-40"
        style={{ background: 'var(--surface-container-lowest)', borderTop: '1px solid var(--outline-variant)' }}>
        {navItems.slice(0, 2).map(({ href, icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} className="flex flex-col items-center gap-1"
              style={{ color: active ? 'var(--primary)' : 'var(--on-surface-variant)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>{icon}</span>
            </Link>
          );
        })}
        {/* FAB center */}
        <div style={{ marginTop: '-40px' }}>
          <button
            onClick={() => setWorkLogOpen(true)}
            className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
            style={{ background: 'var(--primary)', color: 'var(--on-primary)' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>add</span>
          </button>
        </div>
        {navItems.slice(2, 4).map(({ href, icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link key={href} href={href} className="flex flex-col items-center gap-1"
              style={{ color: active ? 'var(--primary)' : 'var(--on-surface-variant)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>{icon}</span>
            </Link>
          );
        })}
      </nav>

      <WorkLogModal isOpen={workLogOpen} onClose={() => setWorkLogOpen(false)} />
    </>
  );
}
