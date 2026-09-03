'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Plus, Edit2, Clock, Paperclip, ExternalLink, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { LoadingState, ErrorState } from '@/components/ui/States';
import { TaskStatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { CopyButton } from '@/components/ui/CopyButton';
import { TaskModal } from '@/features/tasks/TaskModal';
import { WorkLogModal } from '@/features/work-logs/WorkLogModal';
import { taskService } from '@/services/taskService';
import { workLogService } from '@/services/workLogService';
import { formatDate, formatFileSize, isImage } from '@/lib/utils';
import type { Attachment } from '@/types';

export default function TaskDetailPage() {
  const params = useParams();
  const rawId = params?.id;
  const taskId = typeof rawId === 'string' ? Number(rawId) : Array.isArray(rawId) ? Number(rawId[0]) : NaN;
  const isValidId = !isNaN(taskId) && taskId > 0;
  const queryClient = useQueryClient();

  const [editTaskOpen, setEditTaskOpen] = useState(false);
  const [addLogOpen, setAddLogOpen] = useState(false);

  const { data: task, isLoading, isError, refetch } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => taskService.getById(taskId),
    enabled: isValidId,
  });

  const deleteAttMutation = useMutation({
    mutationFn: (id: number) => workLogService.deleteAttachment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
    },
  });

  if (isLoading) return <LoadingState label="Loading task details..." />;
  if (isError || !task) return <ErrorState message="Task not found" onRetry={refetch} />;

  return (
    <div>
      <Link href="/tasks" className="inline-flex items-center gap-1 text-xs text-[#8b91a8] hover:text-[#e8eaf0] mb-4">
        <ArrowLeft size={14} /> Back to Tasks
      </Link>

      <PageHeader
        title={task.title}
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setEditTaskOpen(true)}>
              <Edit2 size={14} /> Edit Task
            </Button>
            <Button size="sm" onClick={() => setAddLogOpen(true)} id="btn-add-worklog-taskdetail">
              <Plus size={14} /> Add Work Log
            </Button>
          </div>
        }
      />

      {/* Task Info Card */}
      <div className="bg-[#13161e] border border-[#252a38] rounded-2xl p-5 mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
          <div>
            <p className="text-xs text-[#525870] mb-1">Project</p>
            <p className="font-semibold text-[#e8eaf0]">{task.project?.name}</p>
          </div>
          <div>
            <p className="text-xs text-[#525870] mb-1">Branch</p>
            {task.branch ? (
              <div className="flex items-center gap-1">
                <code className="branch-name text-[#6366f1]">{task.branch.name}</code>
                <CopyButton text={task.branch.name} />
              </div>
            ) : (
              <span className="text-[#525870]">No branch</span>
            )}
          </div>
          <div>
            <p className="text-xs text-[#525870] mb-1">Status & Priority</p>
            <div className="flex items-center gap-2">
              <TaskStatusBadge status={task.status} />
              <PriorityBadge priority={task.priority} />
            </div>
          </div>
          <div>
            <p className="text-xs text-[#525870] mb-1">Due Date</p>
            <p className="text-[#8b91a8]">{task.due_date ? formatDate(task.due_date) : 'No due date'}</p>
          </div>
        </div>

        {task.description && (
          <div className="pt-4 border-t border-[#252a38]">
            <p className="text-xs text-[#525870] mb-1">Description</p>
            <p className="text-sm text-[#8b91a8] whitespace-pre-line">{task.description}</p>
          </div>
        )}
      </div>

      {/* Work Log Timeline */}
      <div className="bg-[#13161e] border border-[#252a38] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-[#6366f1]" />
            <h3 className="font-semibold text-[#e8eaf0]">Work Log Timeline ({task.work_logs?.length || 0})</h3>
          </div>
          <Button size="sm" variant="ghost" onClick={() => setAddLogOpen(true)}>
            <Plus size={14} /> Add Entry
          </Button>
        </div>

        {!task.work_logs || task.work_logs.length === 0 ? (
          <p className="text-sm text-[#525870] text-center py-8">
            No work logs recorded for this task yet. Click &quot;Add Work Log&quot; to add one.
          </p>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#252a38]">
            {task.work_logs.map((log) => (
              <div key={log.id} className="relative">
                <div className="absolute -left-[23px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#6366f1] ring-4 ring-[#13161e]" />

                <div className="bg-[#1a1e28] border border-[#252a38] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-base font-bold text-[#e8eaf0]">{log.title}</h4>
                    <span className="text-xs text-[#525870] font-medium">{formatDate(log.work_date)}</span>
                  </div>

                  {log.branch && (
                    <div className="mb-2">
                      <span className="text-xs text-[#525870] mr-2">Branch:</span>
                      <code className="branch-name text-xs text-[#6366f1] bg-[#6366f1]/10 px-2 py-0.5 rounded">
                        {log.branch.name}
                      </code>
                    </div>
                  )}

                  {log.description && (
                    <p className="text-sm text-[#8b91a8] mb-3 whitespace-pre-line">{log.description}</p>
                  )}

                  {/* Result, Blocker, Next Plan Cards */}
                  <div className="space-y-1.5 mb-3">
                    {log.result && (
                      <div className="p-2.5 rounded-lg bg-green-500/10 border border-green-500/20 text-xs text-green-300">
                        <strong className="font-semibold block text-green-400 mb-0.5">Result:</strong>
                        {log.result}
                      </div>
                    )}
                    {log.blocker && (
                      <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-300">
                        <strong className="font-semibold block text-red-400 mb-0.5">Blocker:</strong>
                        {log.blocker}
                      </div>
                    )}
                    {log.next_plan && (
                      <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
                        <strong className="font-semibold block text-blue-400 mb-0.5">Next Plan:</strong>
                        {log.next_plan}
                      </div>
                    )}
                  </div>

                  {/* Attachments */}
                  {log.attachments && log.attachments.length > 0 && (
                    <div className="pt-3 border-t border-[#252a38]">
                      <p className="text-xs font-semibold text-[#8b91a8] mb-2 flex items-center gap-1">
                        <Paperclip size={12} /> Attachments ({log.attachments.length})
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {log.attachments.map((att: Attachment) => (
                          <div
                            key={att.id}
                            className="p-2 rounded-lg bg-[#13161e] border border-[#252a38] flex items-center justify-between gap-2"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              {isImage(att.mime_type) ? (
                                <span className="text-lg">🖼️</span>
                              ) : (
                                <span className="text-lg">📄</span>
                              )}
                              <div className="min-w-0">
                                <a
                                  href={att.file_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs font-medium text-[#e8eaf0] hover:text-[#6366f1] truncate block"
                                >
                                  {att.original_file_name}
                                </a>
                                <span className="text-[10px] text-[#525870]">
                                  {formatFileSize(att.file_size)}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              <a
                                href={att.file_url}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1 text-[#525870] hover:text-[#6366f1]"
                                title="Open File"
                              >
                                <ExternalLink size={12} />
                              </a>
                              <button
                                onClick={() => deleteAttMutation.mutate(att.id)}
                                className="p-1 text-[#525870] hover:text-red-400"
                                title="Delete Attachment"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <TaskModal isOpen={editTaskOpen} onClose={() => setEditTaskOpen(false)} task={task} />
      <WorkLogModal isOpen={addLogOpen} onClose={() => setAddLogOpen(false)} taskId={taskId} />
    </div>
  );
}
