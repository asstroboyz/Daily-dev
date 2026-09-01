'use client';

import { cn } from '@/lib/utils';
import type { BranchStatus, TaskStatus, TaskPriority } from '@/types';

const branchStatusConfig: Record<BranchStatus, { label: string; className: string }> = {
  planned: { label: 'Planned', className: 'bg-slate-500/20 text-slate-300 border-slate-500/30' },
  in_progress: { label: 'In Progress', className: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  testing: { label: 'Testing', className: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
  ready_to_merge: { label: 'Ready to Merge', className: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  merged: { label: 'Merged', className: 'bg-green-500/20 text-green-300 border-green-500/30' },
  abandoned: { label: 'Abandoned', className: 'bg-red-500/20 text-red-300 border-red-500/30' },
};

const taskStatusConfig: Record<TaskStatus, { label: string; className: string }> = {
  todo: { label: 'Todo', className: 'bg-slate-500/20 text-slate-300 border-slate-500/30' },
  in_progress: { label: 'In Progress', className: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  testing: { label: 'Testing', className: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
  done: { label: 'Done', className: 'bg-green-500/20 text-green-300 border-green-500/30' },
  cancelled: { label: 'Cancelled', className: 'bg-red-500/20 text-red-300 border-red-500/30' },
};

const priorityConfig: Record<TaskPriority, { label: string; className: string }> = {
  low: { label: 'Low', className: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
  normal: { label: 'Normal', className: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  high: { label: 'High', className: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
  urgent: { label: 'Urgent', className: 'bg-red-500/20 text-red-300 border-red-500/30' },
};

export function BranchStatusBadge({ status }: { status: BranchStatus }) {
  const cfg = branchStatusConfig[status] ?? { label: status, className: 'bg-slate-500/20 text-slate-300 border-slate-500/30' };
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border', cfg.className)}>
      {cfg.label}
    </span>
  );
}

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const cfg = taskStatusConfig[status] ?? { label: status, className: 'bg-slate-500/20 text-slate-300 border-slate-500/30' };
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border', cfg.className)}>
      {cfg.label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const cfg = priorityConfig[priority] ?? { label: priority, className: 'bg-slate-500/20 text-slate-300' };
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border', cfg.className)}>
      {cfg.label}
    </span>
  );
}
