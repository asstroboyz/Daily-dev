'use client';

import { useState } from 'react';
import { WorkLogModal } from '@/features/work-logs/WorkLogModal';
import { Modal } from '@/components/ui/Modal';

export function TopHeader() {
  const [workLogOpen, setWorkLogOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <>
      <header
        className="fixed top-0 right-0 lg:left-[240px] left-0 h-16 z-40 flex items-center justify-between px-4 lg:px-6"
        style={{
          background: 'rgba(11, 19, 38, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--outline-variant)',
        }}
      >
        {/* Left: breadcrumb path indicator */}
        <div className="flex items-center gap-4" style={{ color: 'var(--on-surface-variant)' }}>
          {/* Mobile menu hint */}
          <span className="material-symbols-outlined lg:hidden cursor-pointer" style={{ fontSize: '22px' }}>
            menu
          </span>
          {/* Breadcrumb */}
          <div className="hidden md:flex items-center gap-2"
            style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            <span style={{ color: 'var(--outline)' }}>~</span>
            <span style={{ color: 'var(--on-surface)', fontWeight: 600 }}>main</span>
            <span style={{ color: 'var(--outline)' }}>/</span>
            <span style={{ color: 'var(--on-surface-variant)' }}>log</span>
          </div>
        </div>

        {/* Right: CTA + Profile Avatar */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setWorkLogOpen(true)}
            id="btn-add-worklog-header"
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:brightness-110 cursor-pointer shadow-sm active:scale-95"
            style={{
              background: 'var(--primary)',
              color: 'var(--on-primary)',
              fontFamily: 'Geist',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
            <span>Add Work Log</span>
          </button>

          {/* Profile Avatar Trigger */}
          <button
            onClick={() => setProfileOpen(true)}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-md"
            style={{ background: 'var(--primary)', border: '2px solid var(--surface-container-high)' }}
            title="User Profile"
          >
            <span className="material-symbols-outlined" style={{ color: 'var(--on-primary)', fontSize: '20px' }}>person</span>
          </button>
        </div>
      </header>

      {/* Work Log Modal */}
      <WorkLogModal isOpen={workLogOpen} onClose={() => setWorkLogOpen(false)} />

      {/* Profile Modal */}
      <Modal isOpen={profileOpen} onClose={() => setProfileOpen(false)} title="Developer Profile" size="sm">
        <div className="flex flex-col items-center text-center space-y-4 py-2">
          <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg"
            style={{ background: 'var(--primary)' }}>
            <span className="material-symbols-outlined text-4xl" style={{ color: 'var(--on-primary)' }}>terminal</span>
          </div>

          <div>
            <h3 className="text-lg font-bold text-on-surface">Developer User</h3>
            <p className="text-body-sm text-on-surface-variant">Lead Fullstack Engineer</p>
          </div>

          <div className="w-full bg-surface-container-high p-4 rounded-xl space-y-2 text-left text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-outline">Role:</span>
              <span className="text-primary font-bold">DEVELOPER</span>
            </div>
            <div className="flex justify-between">
              <span className="text-outline">Backend Server:</span>
              <span className="text-secondary">localhost:8080</span>
            </div>
            <div className="flex justify-between">
              <span className="text-outline">Auth Token:</span>
              <span className="text-tertiary">dev-local-token</span>
            </div>
            <div className="flex justify-between">
              <span className="text-outline">Database:</span>
              <span className="text-on-surface">PostgreSQL (GORM)</span>
            </div>
          </div>

          <div className="w-full pt-2 flex justify-end">
            <button
              onClick={() => setProfileOpen(false)}
              className="w-full py-2.5 rounded-xl font-semibold bg-surface-container-highest text-on-surface hover:bg-surface-bright transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
