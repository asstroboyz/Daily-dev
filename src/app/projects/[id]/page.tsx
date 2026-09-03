'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, ExternalLink, GitBranch, CheckSquare, Clock } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { LoadingState, ErrorState } from '@/components/ui/States';
import { BranchStatusBadge, TaskStatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { BranchName } from '@/components/ui/CopyButton';
import { projectService } from '@/services/projectService';
import { branchService } from '@/services/branchService';
import { taskService } from '@/services/taskService';
import { workLogService } from '@/services/workLogService';
import { formatDateShort } from '@/lib/utils';

export default function ProjectDetailPage() {
  const params = useParams();
  const rawId = params?.id;
  const projectId = typeof rawId === 'string' ? Number(rawId) : Array.isArray(rawId) ? Number(rawId[0]) : NaN;
  const isValidId = !isNaN(projectId) && projectId > 0;

  const { data: project, isLoading, isError, refetch } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectService.getById(projectId),
    enabled: isValidId,
  });

  const { data: branches = [] } = useQuery({
    queryKey: ['branches', { project_id: projectId }],
    queryFn: () => branchService.getAll({ project_id: projectId }),
    enabled: isValidId,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', { project_id: projectId }],
    queryFn: () => taskService.getAll({ project_id: projectId }),
    enabled: isValidId,
  });

  const { data: workLogs = [] } = useQuery({
    queryKey: ['work-logs', { project_id: projectId }],
    queryFn: () => workLogService.getAll({ project_id: projectId }),
    enabled: isValidId,
  });

  if (isLoading) return <LoadingState label="Loading project details..." />;
  if (isError || !project) return <ErrorState message="Project not found" onRetry={refetch} />;

  const activeBranches = branches.filter((b) => b.status !== 'merged' && b.status !== 'abandoned');
  const openTasks = tasks.filter((t) => t.status !== 'done' && t.status !== 'cancelled');

  return (
    <div>
      <Link href="/projects" className="inline-flex items-center gap-1 text-xs text-[#8b91a8] hover:text-[#e8eaf0] mb-4">
        <ArrowLeft size={14} /> Back to Projects
      </Link>

      <PageHeader
        title={project.name}
        description={project.description || undefined}
        actions={
          project.repository_url ? (
            <a
              href={project.repository_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#252a38] text-[#e8eaf0] hover:bg-[#2d3347] text-xs font-medium"
            >
              <ExternalLink size={14} /> Repository
            </a>
          ) : undefined
        }
      />

      {/* Overview Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-[#13161e] border border-[#252a38] rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#6366f1]/10 flex items-center justify-center text-[#6366f1]">
            <GitBranch size={20} />
          </div>
          <div>
            <p className="text-2xl font-bold text-[#e8eaf0]">{activeBranches.length}</p>
            <p className="text-xs text-[#525870]">Active Branches</p>
          </div>
        </div>

        <div className="bg-[#13161e] border border-[#252a38] rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#22c55e]/10 flex items-center justify-center text-[#22c55e]">
            <CheckSquare size={20} />
          </div>
          <div>
            <p className="text-2xl font-bold text-[#e8eaf0]">{openTasks.length}</p>
            <p className="text-xs text-[#525870]">Open Tasks</p>
          </div>
        </div>

        <div className="bg-[#13161e] border border-[#252a38] rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#f59e0b]/10 flex items-center justify-center text-[#f59e0b]">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-2xl font-bold text-[#e8eaf0]">{workLogs.length}</p>
            <p className="text-xs text-[#525870]">Total Work Logs</p>
          </div>
        </div>
      </div>

      {/* Grid: Branches + Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Active Branches */}
        <div className="bg-[#13161e] border border-[#252a38] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[#e8eaf0]">Branches ({branches.length})</h3>
            <Link href={`/branches?project_id=${projectId}`} className="text-xs text-[#6366f1] hover:underline">
              View All
            </Link>
          </div>
          {branches.length === 0 ? (
            <p className="text-sm text-[#525870]">No branches created yet.</p>
          ) : (
            <div className="space-y-3">
              {branches.slice(0, 5).map((branch) => (
                <div key={branch.id} className="flex items-center justify-between p-3 rounded-xl bg-[#1a1e28] border border-[#252a38]">
                  <div>
                    <BranchName name={branch.name} />
                    {branch.purpose && <p className="text-xs text-[#8b91a8] mt-1">{branch.purpose}</p>}
                  </div>
                  <BranchStatusBadge status={branch.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tasks */}
        <div className="bg-[#13161e] border border-[#252a38] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[#e8eaf0]">Tasks ({tasks.length})</h3>
            <Link href={`/tasks?project_id=${projectId}`} className="text-xs text-[#6366f1] hover:underline">
              View All
            </Link>
          </div>
          {tasks.length === 0 ? (
            <p className="text-sm text-[#525870]">No tasks created yet.</p>
          ) : (
            <div className="space-y-3">
              {tasks.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 rounded-xl bg-[#1a1e28] border border-[#252a38]">
                  <div>
                    <Link href={`/tasks/${task.id}`} className="text-sm font-medium text-[#e8eaf0] hover:text-[#6366f1]">
                      {task.title}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <TaskStatusBadge status={task.status} />
                      <PriorityBadge priority={task.priority} />
                    </div>
                  </div>
                  {task.branch && <code className="branch-name text-xs text-[#6366f1]">{task.branch.name}</code>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Work Logs */}
      <div className="bg-[#13161e] border border-[#252a38] rounded-2xl p-5">
        <h3 className="font-semibold text-[#e8eaf0] mb-4">Recent Activity</h3>
        {workLogs.length === 0 ? (
          <p className="text-sm text-[#525870]">No work logs recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {workLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="p-3 rounded-xl bg-[#1a1e28] border border-[#252a38] flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-[#e8eaf0]">{log.title}</p>
                  {log.description && <p className="text-xs text-[#8b91a8] mt-0.5">{log.description}</p>}
                  <p className="text-xs text-[#525870] mt-1">Task: {log.task?.title}</p>
                </div>
                <span className="text-xs text-[#525870] whitespace-nowrap ml-4">
                  {formatDateShort(log.work_date)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
