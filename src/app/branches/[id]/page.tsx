'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, CheckSquare, Clock } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { LoadingState, ErrorState } from '@/components/ui/States';
import { BranchStatusBadge, TaskStatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { CopyButton } from '@/components/ui/CopyButton';
import { branchService } from '@/services/branchService';
import { taskService } from '@/services/taskService';
import { workLogService } from '@/services/workLogService';
import { formatDate } from '@/lib/utils';

export default function BranchDetailPage() {
  const params = useParams();
  const rawId = params?.id;
  const branchId = typeof rawId === 'string' ? Number(rawId) : Array.isArray(rawId) ? Number(rawId[0]) : NaN;
  const isValidId = !isNaN(branchId) && branchId > 0;

  const { data: branch, isLoading, isError, refetch } = useQuery({
    queryKey: ['branch', branchId],
    queryFn: () => branchService.getById(branchId),
    enabled: isValidId,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', { branch_id: branchId }],
    queryFn: () => taskService.getAll({ branch_id: branchId }),
    enabled: isValidId,
  });

  const { data: workLogs = [] } = useQuery({
    queryKey: ['work-logs', { branch_id: branchId }],
    queryFn: () => workLogService.getAll({ branch_id: branchId }),
    enabled: isValidId,
  });

  if (isLoading) return <LoadingState label="Loading branch details..." />;
  if (isError || !branch) return <ErrorState message="Branch not found" onRetry={refetch} />;

  return (
    <div>
      <Link href="/branches" className="inline-flex items-center gap-1 text-xs text-[#8b91a8] hover:text-[#e8eaf0] mb-4">
        <ArrowLeft size={14} /> Back to Branches
      </Link>

      <PageHeader
        title={branch.name}
        description={branch.purpose || undefined}
        actions={<CopyButton text={branch.name} label="Copy Branch" />}
      />

      {/* Info Card */}
      <div className="bg-[#13161e] border border-[#252a38] rounded-2xl p-5 mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-xs text-[#525870] mb-1">Project</p>
            <p className="font-semibold text-[#e8eaf0]">{branch.project?.name}</p>
          </div>
          <div>
            <p className="text-xs text-[#525870] mb-1">Base Branch</p>
            <code className="branch-name text-[#6366f1]">{branch.base_branch || 'development'}</code>
          </div>
          <div>
            <p className="text-xs text-[#525870] mb-1">Status</p>
            <BranchStatusBadge status={branch.status} />
          </div>
          <div>
            <p className="text-xs text-[#525870] mb-1">Created Date</p>
            <p className="text-[#8b91a8]">{formatDate(branch.created_at)}</p>
          </div>
        </div>

        {branch.notes && (
          <div className="mt-4 pt-4 border-t border-[#252a38]">
            <p className="text-xs text-[#525870] mb-1">Notes</p>
            <p className="text-sm text-[#8b91a8]">{branch.notes}</p>
          </div>
        )}
      </div>

      {/* Related Tasks */}
      <div className="bg-[#13161e] border border-[#252a38] rounded-2xl p-5 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <CheckSquare size={18} className="text-[#6366f1]" />
          <h3 className="font-semibold text-[#e8eaf0]">Related Tasks ({tasks.length})</h3>
        </div>
        {tasks.length === 0 ? (
          <p className="text-sm text-[#525870]">No tasks linked to this branch.</p>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className="p-3 rounded-xl bg-[#1a1e28] border border-[#252a38] flex items-center justify-between">
                <div>
                  <Link href={`/tasks/${task.id}`} className="text-sm font-medium text-[#e8eaf0] hover:text-[#6366f1]">
                    {task.title}
                  </Link>
                  <div className="flex items-center gap-2 mt-1">
                    <TaskStatusBadge status={task.status} />
                    <PriorityBadge priority={task.priority} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Activity Timeline */}
      <div className="bg-[#13161e] border border-[#252a38] rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={18} className="text-[#22c55e]" />
          <h3 className="font-semibold text-[#e8eaf0]">Activity Timeline ({workLogs.length})</h3>
        </div>
        {workLogs.length === 0 ? (
          <p className="text-sm text-[#525870]">No activity recorded for this branch yet.</p>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#252a38]">
            {workLogs.map((log) => (
              <div key={log.id} className="relative">
                {/* Dot */}
                <div className="absolute -left-[23px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#6366f1] ring-4 ring-[#13161e]" />

                <div className="bg-[#1a1e28] border border-[#252a38] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-bold text-[#e8eaf0]">{log.title}</h4>
                    <span className="text-xs text-[#525870]">{formatDate(log.work_date)}</span>
                  </div>

                  {log.description && <p className="text-sm text-[#8b91a8] mb-2">{log.description}</p>}
                  {log.result && <p className="text-xs text-green-400 bg-green-500/10 px-2.5 py-1 rounded-lg mb-1"><strong>Result:</strong> {log.result}</p>}
                  {log.blocker && <p className="text-xs text-red-400 bg-red-500/10 px-2.5 py-1 rounded-lg mb-1"><strong>Blocker:</strong> {log.blocker}</p>}
                  {log.next_plan && <p className="text-xs text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg"><strong>Next Plan:</strong> {log.next_plan}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
