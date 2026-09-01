'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { branchService } from '@/services/branchService';
import { projectService } from '@/services/projectService';
import { taskService } from '@/services/taskService';
import { BranchModal } from '@/features/branches/BranchModal';
import { ConfirmDialog } from '@/components/ui/Modal';
import { ErrorState } from '@/components/ui/States';
import { formatDateShort } from '@/lib/utils';
import type { Branch, BranchStatus } from '@/types';

const statusDisplay: Record<BranchStatus, { label: string; bg: string; text: string; dot: string }> = {
  planned:        { label: 'Planned',        bg: 'rgba(70,69,84,0.4)',     text: 'var(--on-surface-variant)', dot: 'var(--outline)' },
  in_progress:    { label: 'In Progress',    bg: 'rgba(217,119,33,0.2)',   text: 'var(--tertiary-container)',  dot: 'var(--tertiary-container)' },
  testing:        { label: 'Testing',        bg: 'rgba(0,162,230,0.2)',    text: 'var(--secondary-container)', dot: 'var(--secondary-container)' },
  ready_to_merge: { label: 'Ready to Merge', bg: 'rgba(128,131,255,0.2)', text: 'var(--primary-container)',   dot: 'var(--primary-container)' },
  merged:         { label: 'Merged',         bg: 'rgba(0,162,230,0.1)',    text: 'var(--secondary)',           dot: 'var(--secondary)' },
  abandoned:      { label: 'Abandoned',      bg: 'rgba(147,0,10,0.2)',     text: 'var(--error)',               dot: 'var(--error)' },
};

function BranchStatusChip({ status }: { status: BranchStatus }) {
  const s = statusDisplay[status];
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded"
      style={{ background: s.bg, color: s.text, fontFamily: 'Geist', fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
      {s.label}
    </span>
  );
}

function CopyBranchBtn({ name }: { name: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async (e) => { e.stopPropagation(); await navigator.clipboard.writeText(name); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="p-1 rounded opacity-0 group-hover/copy:opacity-100 transition-all hover:bg-[var(--surface-container-high)]"
      style={{ color: copied ? 'var(--secondary)' : 'var(--on-surface-variant)', fontSize: '14px' }}
      title="Copy branch name"
    >
      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>{copied ? 'check' : 'content_copy'}</span>
    </button>
  );
}

export default function BranchesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<BranchStatus | ''>('');
  const [filterProject, setFilterProject] = useState<string>('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [deletingBranch, setDeletingBranch] = useState<Branch | null>(null);

  const { data: projects = [] } = useQuery({ queryKey: ['projects'], queryFn: projectService.getAll });
  const { data: branches = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['branches', { search, filterStatus, filterProject }],
    queryFn: () => branchService.getAll({
      search: search || undefined,
      project_id: filterProject ? Number(filterProject) : undefined,
      status: filterStatus || undefined,
    }),
  });
  const { data: tasks = [] } = useQuery({ queryKey: ['tasks'], queryFn: () => taskService.getAll() });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => branchService.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['branches'] }); setDeletingBranch(null); },
  });

  if (isError) return <ErrorState message="Failed to load branches" onRetry={refetch} />;

  return (
    <div className="flex flex-col gap-6 py-4 animate-fade-in">
      {/* Page Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 style={{ fontFamily: 'Geist', fontSize: '24px', fontWeight: 600, color: 'var(--on-surface)', letterSpacing: '-0.02em' }}>
            Branches
          </h1>
          <p style={{ fontFamily: 'Geist', fontSize: '14px', color: 'var(--on-surface-variant)', marginTop: '4px' }}>
            Find and manage development branches across all projects.
          </p>
        </div>

        {/* Search + Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ fontSize: '20px', color: 'var(--on-surface-variant)' }}>search</span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search branch, purpose..."
              className="w-full h-10 pl-10 pr-4 rounded-lg transition-all"
              style={{
                background: 'var(--surface-container-high)',
                color: 'var(--on-surface)',
                border: '1px solid transparent',
                fontFamily: 'Geist', fontSize: '14px', outline: 'none',
              }}
              onFocus={e => { (e.target as HTMLInputElement).style.boxShadow = '0 0 0 1px var(--primary)'; (e.target as HTMLInputElement).style.borderColor = 'var(--primary)'; }}
              onBlur={e => { (e.target as HTMLInputElement).style.boxShadow = 'none'; (e.target as HTMLInputElement).style.borderColor = 'transparent'; }}
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as BranchStatus | '')}
              className="h-10 px-3 rounded-lg cursor-pointer"
              style={{ background: 'var(--surface-container-high)', color: 'var(--on-surface-variant)', fontFamily: 'Geist', fontSize: '13px', outline: 'none', border: 'none' }}
            >
              <option value="">All Statuses</option>
              <option value="planned">Planned</option>
              <option value="in_progress">In Progress</option>
              <option value="testing">Testing</option>
              <option value="ready_to_merge">Ready to Merge</option>
              <option value="merged">Merged</option>
              <option value="abandoned">Abandoned</option>
            </select>
            <button
              onClick={() => { setModalOpen(true); setEditingBranch(null); }}
              className="h-10 px-4 rounded-lg flex items-center gap-2 transition-all hover:brightness-110"
              style={{ background: 'var(--primary)', color: 'var(--on-primary)', fontFamily: 'Geist', fontSize: '14px', fontWeight: 600 }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
              <span className="hidden sm:inline">Add Branch</span>
            </button>
          </div>
        </div>
      </header>

      {/* Desktop Table */}
      <div className="hidden md:block w-full rounded-xl overflow-hidden" style={{ background: 'var(--surface-container)' }}>
        {isLoading ? (
          <div className="p-12 text-center" style={{ color: 'var(--on-surface-variant)', fontSize: '13px' }}>Loading...</div>
        ) : branches.length === 0 ? (
          <div className="p-12 text-center" style={{ color: 'var(--on-surface-variant)', fontSize: '13px' }}>
            {search ? `No branches match "${search}"` : 'No branches yet. Create your first branch!'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left" style={{ fontFamily: 'Geist', fontSize: '13px' }}>
              <thead style={{ background: 'var(--surface-container-low)', color: 'var(--on-surface-variant)' }}>
                <tr>
                  {['Branch', 'Project & Repo', 'Purpose', 'Status', 'Meta', 'Actions'].map((h, i) => (
                    <th key={h} className="px-6 py-4"
                      style={{ fontFamily: 'Geist', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: i === 5 ? 'right' : 'left' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody style={{ color: 'var(--on-surface)' }}>
                {branches.map(branch => {
                  const branchTasks = tasks.filter(t => t.branch_id === branch.id);
                  return (
                    <tr key={branch.id}
                      className="group transition-colors"
                      style={{ borderTop: '1px solid var(--outline-variant)' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(45,52,73,0.5)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                    >
                      {/* Branch Name */}
                      <td className="px-6 py-4 align-top">
                        <div className="flex items-center gap-2 group/copy cursor-pointer">
                          <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--primary)' }}>call_split</span>
                          <code className="truncate max-w-[200px]" title={branch.name}
                            style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: 'var(--primary)' }}>
                            {branch.name}
                          </code>
                          <CopyBranchBtn name={branch.name} />
                        </div>
                      </td>
                      {/* Project */}
                      <td className="px-6 py-4 align-top">
                        <div className="flex flex-col gap-1">
                          <span style={{ fontWeight: 600, color: 'var(--on-surface)' }}>{branch.project?.name}</span>
                          <span className="px-2 py-0.5 rounded w-fit"
                            style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: 'var(--on-surface-variant)', background: 'var(--surface-container-high)' }}>
                            {branch.project?.name?.toLowerCase().replace(/\s+/g, '-')}
                          </span>
                        </div>
                      </td>
                      {/* Purpose */}
                      <td className="px-6 py-4 align-top" style={{ color: 'var(--on-surface-variant)' }}>
                        {branch.purpose || '-'}
                      </td>
                      {/* Status */}
                      <td className="px-6 py-4 align-top">
                        <BranchStatusChip status={branch.status} />
                      </td>
                      {/* Meta */}
                      <td className="px-6 py-4 align-top">
                        <div className="flex flex-col gap-1" style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>checklist</span>
                            {branchTasks.length} Tasks
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>schedule</span>
                            {formatDateShort(branch.updated_at)}
                          </span>
                        </div>
                      </td>
                      {/* Actions */}
                      <td className="px-6 py-4 align-top text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link href={`/branches/${branch.id}`}>
                            <button className="p-1.5 rounded transition-colors hover:bg-[var(--primary)]/10 hover:text-[var(--primary)]"
                              style={{ color: 'var(--on-surface-variant)' }} title="View">
                              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>visibility</span>
                            </button>
                          </Link>
                          <button
                            onClick={() => { setEditingBranch(branch); setModalOpen(true); }}
                            className="p-1.5 rounded transition-colors hover:bg-[var(--primary)]/10 hover:text-[var(--primary)]"
                            style={{ color: 'var(--on-surface-variant)' }} title="Edit">
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                          </button>
                          <button
                            onClick={() => setDeletingBranch(branch)}
                            className="p-1.5 rounded transition-colors hover:bg-[var(--error)]/10 hover:text-[var(--error)]"
                            style={{ color: 'var(--on-surface-variant)' }} title="Delete">
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden flex flex-col gap-4">
        {isLoading ? (
          <div className="p-8 text-center" style={{ color: 'var(--on-surface-variant)' }}>Loading...</div>
        ) : branches.map(branch => (
          <div key={branch.id} className="rounded-xl p-4 flex flex-col gap-3" style={{ background: 'var(--surface-container)' }}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg flex-1 overflow-hidden"
                style={{ background: 'rgba(192,193,255,0.1)' }}>
                <span className="material-symbols-outlined shrink-0" style={{ fontSize: '16px', color: 'var(--primary)' }}>call_split</span>
                <code className="truncate" style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--primary)' }}>{branch.name}</code>
              </div>
              <button onClick={async () => { await navigator.clipboard.writeText(branch.name); }}
                className="p-1.5 rounded-lg shrink-0" style={{ color: 'var(--on-surface-variant)', background: 'var(--surface-container-high)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>content_copy</span>
              </button>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span style={{ fontFamily: 'Geist', fontSize: '14px', fontWeight: 600, color: 'var(--on-surface)' }}>{branch.project?.name}</span>
              </div>
              <p style={{ fontFamily: 'Geist', fontSize: '13px', color: 'var(--on-surface-variant)' }}>{branch.purpose || '-'}</p>
            </div>
            <div className="flex items-center justify-between pt-2">
              <BranchStatusChip status={branch.status} />
              <div className="flex gap-2">
                <Link href={`/branches/${branch.id}`}>
                  <button className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                    style={{ background: 'var(--surface-container-high)', color: 'var(--on-surface)' }}>View</button>
                </Link>
                <button onClick={() => { setEditingBranch(branch); setModalOpen(true); }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                  style={{ background: 'var(--surface-container-high)', color: 'var(--on-surface)' }}>Edit</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <BranchModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditingBranch(null); }} branch={editingBranch} />
      <ConfirmDialog isOpen={!!deletingBranch} onClose={() => setDeletingBranch(null)}
        onConfirm={() => deletingBranch && deleteMutation.mutate(deletingBranch.id)}
        title={`Delete "${deletingBranch?.name}"?`} loading={deleteMutation.isPending} />
    </div>
  );
}
