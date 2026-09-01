'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

export default function SettingsPage() {
  const [token, setToken] = useState(
    typeof window !== 'undefined'
      ? localStorage.getItem('ACCESS_TOKEN') || process.env.NEXT_PUBLIC_ACCESS_TOKEN || 'dev-local-token'
      : 'dev-local-token'
  );
  const [saved, setSaved] = useState(false);

  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  const backendHealthUrl = `http://${hostname}:8080/health`;

  const { data: health, isLoading: checkingHealth, refetch } = useQuery({
    queryKey: ['health', hostname],
    queryFn: async () => {
      try {
        const res = await fetch(backendHealthUrl);
        if (res.ok) {
          const data = await res.json();
          return { status: 'online', message: `Backend service is ONLINE at ${backendHealthUrl} (Status: ${data.status})` };
        }
        return { status: 'error', message: `HTTP ${res.status}: Backend returned error` };
      } catch (err: unknown) {
        return {
          status: 'offline',
          message: err instanceof Error ? err.message : `Cannot reach backend at ${backendHealthUrl}`,
        };
      }
    },
  });

  const handleSaveToken = () => {
    localStorage.setItem('ACCESS_TOKEN', token);
    setSaved(true);
    refetch();
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto space-y-6 py-4 animate-fade-in">
      <div>
        <h1 style={{ fontFamily: 'Geist', fontSize: '24px', fontWeight: 600, color: 'var(--on-surface)' }}>
          Settings & Environment
        </h1>
        <p style={{ fontFamily: 'Geist', fontSize: '14px', color: 'var(--on-surface-variant)', marginTop: '4px' }}>
          Configure API credentials, database connections, and system preferences.
        </p>
      </div>

      {/* Backend Status Card */}
      <div className="bg-surface-container rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-2xl">dns</span>
            <div>
              <h2 className="text-base font-semibold text-on-surface">Go Backend Connection</h2>
              <p className="text-xs text-on-surface-variant font-mono">{backendHealthUrl}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${health?.status === 'online' ? 'bg-secondary animate-pulse' : 'bg-error'}`} />
            <span className="text-xs font-semibold uppercase tracking-wider text-on-surface">
              {checkingHealth ? 'Checking...' : health?.status || 'Unknown'}
            </span>
          </div>
        </div>

        <p className="text-xs text-on-surface-variant bg-surface-container-high p-3 rounded-lg font-mono">
          {checkingHealth ? 'Connecting to backend...' : health?.message}
        </p>

        <button
          onClick={() => refetch()}
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm">refresh</span> Re-check Connection
        </button>
      </div>

      {/* API Authentication Card */}
      <div className="bg-surface-container rounded-xl p-6 shadow-sm space-y-4">
        <h2 className="text-base font-semibold text-on-surface">API Authentication Token</h2>
        <p className="text-body-sm text-on-surface-variant">
          Matches the <code className="text-primary font-mono">ACCESS_TOKEN</code> set in backend <code className="font-mono text-secondary">.env</code> file.
        </p>

        <div className="flex gap-3">
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-mono bg-surface-container-high text-on-surface border border-outline-variant outline-none focus:border-primary"
          />
          <button
            onClick={handleSaveToken}
            className="px-5 py-2.5 rounded-xl font-semibold bg-primary text-on-primary hover:brightness-110 transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">{saved ? 'check' : 'save'}</span>
            <span>{saved ? 'Saved!' : 'Save Token'}</span>
          </button>
        </div>
      </div>

      {/* Storage & DB Info */}
      <div className="bg-surface-container rounded-xl p-6 shadow-sm space-y-4">
        <h2 className="text-base font-semibold text-on-surface">Database & Storage Engine</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-surface-container-high p-4 rounded-xl space-y-1">
            <span className="text-xs text-outline uppercase font-semibold">ORM & Database</span>
            <p className="text-sm font-semibold text-on-surface">GORM + PostgreSQL</p>
            <p className="text-xs text-on-surface-variant">AutoMigrate enabled on startup</p>
          </div>
          <div className="bg-surface-container-high p-4 rounded-xl space-y-1">
            <span className="text-xs text-outline uppercase font-semibold">File Storage</span>
            <p className="text-sm font-semibold text-on-surface">Supabase Storage Bucket</p>
            <p className="text-xs text-on-surface-variant">Bucket: <code className="text-tertiary">worklog-attachments</code></p>
          </div>
        </div>
      </div>
    </div>
  );
}
