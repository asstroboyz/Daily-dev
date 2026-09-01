'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { WorkLogModal } from '@/features/work-logs/WorkLogModal';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/States';
import { CopyButton } from '@/components/ui/CopyButton';
import { taskService } from '@/services/taskService';
import { branchService } from '@/services/branchService';
import { workLogService } from '@/services/workLogService';
import { today, formatDateShort } from '@/lib/utils';

// Status badge color helpers matching design
const statusStyle: Record<string, { bg: string; text: string; dot?: string }> = {
  testing: { bg: 'rgba(0,162,230,0.2)', text: 'var(--secondary-container)', dot: 'var(--secondary-container)' },
  in_progress: { bg: 'rgba(128,131,255,0.2)', text: 'var(--primary-container)', dot: 'var(--primary-container)' },
  todo: { bg: 'rgba(70,69,84,0.5)', text: 'var(--on-surface-variant)', dot: 'var(--outline)' },
  done: { bg: 'rgba(0,162,230,0.2)', text: 'var(--secondary-container)', dot: 'var(--secondary)' },
  cancelled: { bg: 'rgba(147,0,10,0.2)', text: 'var(--error)', dot: 'var(--error)' },
};

const priorityStyle: Record<string, { bg: string; text: string }> = {
  low: { bg: 'rgba(70,69,84,0.5)', text: 'var(--on-surface-variant)' },
  normal: { bg: 'rgba(70,69,84,0.5)', text: 'var(--on-surface-variant)' },
  high: { bg: 'rgba(217,119,33,0.2)', text: 'var(--tertiary-container)' },
  urgent: { bg: 'rgba(147,0,10,0.2)', text: 'var(--error)' },
};

function StatusBadge({ status }: { status: string }) {
  const s = statusStyle[status] ?? { bg: 'rgba(70,69,84,0.5)', text: 'var(--on-surface-variant)', dot: 'var(--outline)' };
  const label = status.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded"
      style={{ background: s.bg, color: s.text, fontFamily: 'Geist', fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em' }}>
      {s.dot && <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot, ...(status === 'in_progress' ? { animation: 'pulse 2s infinite' } : {}) }} />}
      {label}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const p = priorityStyle[priority] ?? { bg: 'rgba(70,69,84,0.5)', text: 'var(--on-surface-variant)' };
  const label = priority.charAt(0).toUpperCase() + priority.slice(1);
  const isHigh = priority === 'high' || priority === 'urgent';
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded"
      style={{ background: p.bg, color: p.text, fontFamily: 'Geist', fontSize: '11px', fontWeight: 700 }}>
      {isHigh && <span className="material-symbols-outlined" style={{ fontSize: '10px' }}>warning</span>}
      {label}
    </span>
  );
}

export default function DashboardPage() {
  const [workLogModalOpen, setWorkLogModalOpen] = useState(false);
  const todayStr = today();

  const { data: tasks = [], isLoading: lt, isError: et, refetch } = useQuery({ queryKey: ['tasks'], queryFn: () => taskService.getAll() });
  const { data: branches = [], isLoading: lb } = useQuery({ queryKey: ['branches'], queryFn: () => branchService.getAll() });
  const { data: workLogs = [], isLoading: ll } = useQuery({ queryKey: ['work-logs'], queryFn: () => workLogService.getAll() });
  const { data: todayLogs = [] } = useQuery({ queryKey: ['work-logs-today', todayStr], queryFn: () => workLogService.getAll({ date: todayStr }) });

  const isLoading = lt || lb || ll;
  if (isLoading) return <DashboardSkeleton />;
  if (et) return <ErrorState message="Backend not connected. Run: go run ./cmd/server" onRetry={refetch} />;

  const openTasks = tasks.filter(t => t.status !== 'done' && t.status !== 'cancelled');
  const activeBranches = branches.filter(b => b.status !== 'merged' && b.status !== 'abandoned');
  const testingBranches = branches.filter(b => b.status === 'testing');

  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  // Status-based left border color for task card
  const taskBorderColor = (status: string) => {
    if (status === 'testing') return 'var(--secondary)';
    if (status === 'in_progress') return 'var(--error)';
    if (status === 'todo') return 'var(--outline-variant)';
    return 'var(--outline)';
  };

  return (
    <div className="flex flex-col gap-4 py-4 animate-fade-in">
      {/* Page Title Row */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h1 style={{ fontFamily: 'Geist', fontSize: '24px', fontWeight: 600, color: 'var(--on-surface)', letterSpacing: '-0.02em', lineHeight: '32px' }}>
            Dashboard
          </h1>
          <p style={{ fontFamily: 'Geist', fontSize: '13px', color: 'var(--on-surface-variant)' }}>
            Overview of today&apos;s development activity.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg"
          style={{ background: 'var(--surface-container)' }}>
          <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '20px' }}>calendar_today</span>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', fontWeight: 600, color: 'var(--on-surface)' }}>
            {dateStr}
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
        {/* Tasks */}
        <div className="p-4 rounded-xl flex flex-col gap-2 cursor-pointer transition-colors group"
          style={{ background: 'var(--surface-container)' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-container-high)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-container)'}
        >
          <div className="flex items-center justify-between">
            <span style={{ fontFamily: 'Geist', fontSize: '11px', fontWeight: 700, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Tasks
            </span>
            <span className="material-symbols-outlined transition-colors group-hover:text-[var(--primary)]"
              style={{ fontSize: '20px', color: 'var(--on-surface-variant)' }}>checklist</span>
          </div>
          <div style={{ fontFamily: 'Geist', fontSize: '32px', fontWeight: 700, color: 'var(--on-surface)', lineHeight: 1 }}>
            {openTasks.length}
          </div>
        </div>

        {/* Work Logs - highlighted */}
        <div className="p-4 rounded-xl flex flex-col gap-2 cursor-pointer transition-colors relative overflow-hidden group"
          style={{ background: 'rgba(192,193,255,0.1)' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(192,193,255,0.2)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(192,193,255,0.1)'}
        >
          <div className="absolute -right-4 -bottom-4 w-16 h-16 rounded-full blur-xl transition-transform duration-500 group-hover:scale-150"
            style={{ background: 'rgba(192,193,255,0.2)' }} />
          <div className="flex items-center justify-between relative z-10">
            <span style={{ fontFamily: 'Geist', fontSize: '11px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Work Logs
            </span>
            <span className="material-symbols-outlined transition-transform group-hover:scale-110"
              style={{ fontSize: '20px', color: 'var(--primary)' }}>subject</span>
          </div>
          <div style={{ fontFamily: 'Geist', fontSize: '32px', fontWeight: 700, color: 'var(--primary)', lineHeight: 1 }} className="relative z-10">
            {todayLogs.length}
          </div>
        </div>

        {/* Branches */}
        <div className="p-4 rounded-xl flex flex-col gap-2 cursor-pointer transition-colors group"
          style={{ background: 'var(--surface-container)' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-container-high)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-container)'}
        >
          <div className="flex items-center justify-between">
            <span style={{ fontFamily: 'Geist', fontSize: '11px', fontWeight: 700, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Branches
            </span>
            <span className="material-symbols-outlined transition-colors group-hover:text-[var(--tertiary)]"
              style={{ fontSize: '20px', color: 'var(--on-surface-variant)' }}>fork_right</span>
          </div>
          <div style={{ fontFamily: 'Geist', fontSize: '32px', fontWeight: 700, color: 'var(--on-surface)', lineHeight: 1 }}>
            {activeBranches.length}
          </div>
        </div>

        {/* Testing */}
        <div className="p-4 rounded-xl flex flex-col gap-2 cursor-pointer transition-colors group"
          style={{ background: 'var(--surface-container)' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-container-high)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-container)'}
        >
          <div className="flex items-center justify-between">
            <span style={{ fontFamily: 'Geist', fontSize: '11px', fontWeight: 700, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Testing
            </span>
            <span className="material-symbols-outlined transition-colors group-hover:text-[var(--error)]"
              style={{ fontSize: '20px', color: 'var(--on-surface-variant)' }}>bug_report</span>
          </div>
          <div style={{ fontFamily: 'Geist', fontSize: '32px', fontWeight: 700, color: 'var(--on-surface)', lineHeight: 1 }}>
            {testingBranches.length}
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Tasks + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-2">
        {/* Left: Today's Tasks */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <h2 style={{ fontFamily: 'Geist', fontSize: '18px', fontWeight: 600, color: 'var(--on-surface)', letterSpacing: '-0.01em' }}>
              Today&apos;s Tasks
            </h2>
            <Link href="/tasks"
              className="flex items-center gap-1 transition-colors hover:opacity-80"
              style={{ fontFamily: 'Geist', fontSize: '11px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              View All
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
            </Link>
          </div>

          <div className="flex flex-col gap-1">
            {openTasks.length === 0 ? (
              <div className="p-8 rounded-xl text-center" style={{ background: 'var(--surface-container)', color: 'var(--on-surface-variant)', fontSize: '14px' }}>
                No active tasks. Great job! 🎉
              </div>
            ) : openTasks.slice(0, 5).map(task => (
              <div key={task.id}
                className="rounded-xl p-4 transition-shadow relative overflow-hidden flex flex-col md:flex-row gap-4 md:items-center justify-between group hover:shadow-md"
                style={{ background: 'var(--surface-container)' }}>
                {/* Left color bar */}
                <div className="absolute left-0 top-0 bottom-0 w-1 opacity-50 group-hover:opacity-100 transition-opacity rounded-l-xl"
                  style={{ background: taskBorderColor(task.status) }} />

                <div className="flex flex-col gap-1.5 flex-1 min-w-0 pl-2">
                  <div className="flex items-center gap-2 mb-1">
                    <StatusBadge status={task.status} />
                    <PriorityBadge priority={task.priority} />
                  </div>
                  <Link href={`/tasks/${task.id}`}>
                    <h3 style={{ fontFamily: 'Geist', fontSize: '14px', fontWeight: 400, color: 'var(--on-surface)' }}
                      className="truncate pr-4 hover:text-[var(--primary)] transition-colors cursor-pointer">
                      {task.title}
                    </h3>
                  </Link>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                    <div className="flex items-center gap-1.5" style={{ color: 'var(--on-surface-variant)' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>folder_open</span>
                      <span style={{ fontSize: '13px' }}>{task.project?.name}</span>
                    </div>
                    {task.branch && (
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded"
                        style={{ background: 'rgba(45,52,73,0.5)', color: 'var(--on-surface-variant)' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>fork_right</span>
                        <code style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--primary)' }}>
                          {task.branch.name}
                        </code>
                        <CopyButton text={task.branch.name} />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 md:pl-4">
                  <Link href={`/tasks/${task.id}`}>
                    <button className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors hover:brightness-110"
                      style={{ background: 'var(--surface-variant)', color: 'var(--on-surface)' }}
                      title="View Task">
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>open_in_new</span>
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Recent Activity */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <h2 style={{ fontFamily: 'Geist', fontSize: '18px', fontWeight: 600, color: 'var(--on-surface)', letterSpacing: '-0.01em' }}>
              Recent Activity
            </h2>
          </div>

          <div className="rounded-xl p-4 flex-1" style={{ background: 'var(--surface-container)' }}>
            {workLogs.length === 0 ? (
              <p style={{ color: 'var(--on-surface-variant)', fontSize: '13px' }}>No work logs recorded yet.</p>
            ) : (
              <div className="relative pl-6 pb-4 ml-2 space-y-6"
                style={{ borderLeft: '2px solid rgba(45,52,73,0.5)' }}>
                {workLogs.slice(0, 5).map((log, idx) => {
                  const dotColors = ['var(--secondary)', 'var(--surface-variant)', 'var(--error)'];
                  const dotColor = dotColors[idx % dotColors.length];
                  const isFirst = idx === 0;
                  return (
                    <div key={log.id} className="relative" style={{ opacity: isFirst ? 1 : idx === 1 ? 0.75 : 0.6 }}>
                      <div className="absolute rounded-full"
                        style={{
                          left: '-31px', top: '4px', width: '12px', height: '12px',
                          background: dotColor,
                          boxShadow: isFirst ? `0 0 8px ${dotColor}80` : undefined,
                          border: idx === 1 ? '1px solid var(--outline-variant)' : undefined,
                        }} />
                      <div className="flex flex-col gap-1">
                        <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'rgba(199,196,215,0.7)' }}>
                          {formatDateShort(log.work_date)}
                        </span>
                        <p style={{ fontFamily: 'Geist', fontSize: '13px', color: 'var(--on-surface)' }}>
                          &quot;{log.title}&quot;
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>
                            in {log.task?.project?.name}
                          </span>
                          {log.branch && (
                            <span className="px-1.5 py-0.5 rounded truncate max-w-[120px]"
                              style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', background: 'var(--surface-variant)', color: 'var(--on-surface-variant)' }}>
                              {log.branch.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <Link href="/reports/daily">
              <button className="w-full mt-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors hover:brightness-110"
                style={{
                  background: 'rgba(45,52,73,0.5)',
                  color: 'var(--on-surface-variant)',
                  fontFamily: 'Geist', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em'
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-variant)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(45,52,73,0.5)'}
              >
                View Full Log
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile FAB Add */}
      <div className="md:hidden mt-4 pb-4">
        <button
          className="w-full py-4 rounded-xl flex items-center justify-center gap-2 transition-all hover:brightness-110 active:scale-95"
          style={{ background: 'var(--primary)', color: 'var(--on-primary)', fontFamily: 'Geist', fontSize: '14px', fontWeight: 600 }}
          onClick={() => setWorkLogModalOpen(true)}
        >
          <span className="material-symbols-outlined">add</span>
          Add Work Log
        </button>
      </div>

      <WorkLogModal isOpen={workLogModalOpen} onClose={() => setWorkLogModalOpen(false)} />
    </div>
  );
}
