'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Plus, Edit2, Trash2, ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/FormFields';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/States';
import { ConfirmDialog } from '@/components/ui/Modal';
import { TaskStatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { CopyButton } from '@/components/ui/CopyButton';
import { TaskModal } from '@/features/tasks/TaskModal';
import { taskService } from '@/services/taskService';
import { projectService } from '@/services/projectService';
import { formatDateShort } from '@/lib/utils';
import type { Task, TaskStatus, TaskPriority } from '@/types';

export default function TasksPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | ''>('');
  const [selectedPriority, setSelectedPriority] = useState<TaskPriority | ''>('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: projectService.getAll,
  });

  const { data: tasks = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['tasks', { search, project_id: selectedProject, status: selectedStatus, priority: selectedPriority }],
    queryFn: () =>
      taskService.getAll({
        search: search || undefined,
        project_id: selectedProject ? Number(selectedProject) : undefined,
        status: selectedStatus || undefined,
        priority: selectedPriority || undefined,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => taskService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setDeletingTask(null);
    },
  });

  if (isLoading) return <LoadingState label="Loading tasks..." />;
  if (isError) return <ErrorState message="Failed to load tasks" onRetry={refetch} />;

  return (
    <div>
      <PageHeader
        title="Tasks"
        description="Manage work items and linked branches"
        actions={
          <Button
            id="btn-add-task"
            onClick={() => {
              setEditingTask(null);
              setModalOpen(true);
            }}
          >
            <Plus size={16} />
            Add Task
          </Button>
        }
      />

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <SearchInput
          id="search-tasks"
          value={search}
          onChange={setSearch}
          placeholder="Search task title, description, project..."
          className="flex-1"
        />

        <div className="flex gap-2 flex-wrap">
          <Select
            id="filter-task-project"
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="w-40"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </Select>

          <Select
            id="filter-task-status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as TaskStatus | '')}
            className="w-36"
          >
            <option value="">All Statuses</option>
            <option value="todo">Todo</option>
            <option value="in_progress">In Progress</option>
            <option value="testing">Testing</option>
            <option value="done">Done</option>
            <option value="cancelled">Cancelled</option>
          </Select>

          <Select
            id="filter-task-priority"
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value as TaskPriority | '')}
            className="w-36"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </Select>
        </div>
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          title="No tasks found"
          description={search ? `No tasks match "${search}"` : 'Create a task to get started.'}
          action={
            <Button onClick={() => setModalOpen(true)}>
              <Plus size={16} />
              Add Task
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-[#13161e] border border-[#252a38] hover:border-[#6366f1]/50 rounded-2xl p-5 transition-all duration-200 group flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <Link
                    href={`/tasks/${task.id}`}
                    className="text-base font-bold text-[#e8eaf0] hover:text-[#6366f1] transition-colors"
                  >
                    {task.title}
                  </Link>
                  <TaskStatusBadge status={task.status} />
                  <PriorityBadge priority={task.priority} />
                </div>

                {task.description && (
                  <p className="text-sm text-[#8b91a8] line-clamp-1 mb-2">{task.description}</p>
                )}

                <div className="flex items-center gap-4 text-xs text-[#8b91a8] flex-wrap">
                  <span>Project: <strong className="text-[#e8eaf0]">{task.project?.name}</strong></span>
                  {task.branch && (
                    <div className="flex items-center gap-1">
                      <span>Branch:</span>
                      <code className="branch-name text-[#6366f1]">{task.branch.name}</code>
                      <CopyButton text={task.branch.name} />
                    </div>
                  )}
                  <span>Last Activity: {formatDateShort(task.updated_at)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center">
                <Link
                  href={`/tasks/${task.id}`}
                  className="px-3 py-1.5 rounded-xl bg-[#252a38] text-[#e8eaf0] hover:bg-[#2d3347] text-xs font-medium inline-flex items-center gap-1"
                >
                  Detail <ArrowRight size={12} />
                </Link>
                <button
                  onClick={() => {
                    setEditingTask(task);
                    setModalOpen(true);
                  }}
                  className="p-2 rounded-xl text-[#8b91a8] hover:text-[#e8eaf0] hover:bg-[#252a38] transition-colors"
                  title="Edit Task"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => setDeletingTask(task)}
                  className="p-2 rounded-xl text-[#8b91a8] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Delete Task"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <TaskModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingTask(null);
        }}
        task={editingTask}
      />

      <ConfirmDialog
        isOpen={!!deletingTask}
        onClose={() => setDeletingTask(null)}
        onConfirm={() => deletingTask && deleteMutation.mutate(deletingTask.id)}
        title={`Delete task "${deletingTask?.title}"?`}
        description="This will mark the task as deleted."
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
