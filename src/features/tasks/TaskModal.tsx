'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea, Label, FormGroup, ErrorMessage } from '@/components/ui/FormFields';
import { taskService } from '@/services/taskService';
import { projectService } from '@/services/projectService';
import { branchService } from '@/services/branchService';
import type { Task, TaskPriority, TaskStatus } from '@/types';

const schema = z.object({
  project_id: z.string().min(1, 'Project is required'),
  branch_id: z.string().optional(),
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'testing', 'done', 'cancelled']),
  priority: z.enum(['low', 'normal', 'high', 'urgent']),
  due_date: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
  defaultProjectId?: number;
}

export function TaskModal({ isOpen, onClose, task, defaultProjectId }: TaskModalProps) {
  const queryClient = useQueryClient();
  const isEditing = !!task;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'todo', priority: 'normal' },
  });

  const selectedProjectId = watch('project_id');

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: projectService.getAll,
    enabled: isOpen,
  });

  const { data: branches = [] } = useQuery({
    queryKey: ['branches', selectedProjectId],
    queryFn: () => branchService.getAll({ project_id: selectedProjectId ? Number(selectedProjectId) : undefined }),
    enabled: isOpen && !!selectedProjectId,
  });

  useEffect(() => {
    if (task && isOpen) {
      setValue('project_id', String(task.project_id));
      setValue('branch_id', task.branch_id ? String(task.branch_id) : '');
      setValue('title', task.title);
      setValue('description', task.description || '');
      setValue('status', task.status);
      setValue('priority', task.priority);
      setValue('due_date', task.due_date ? task.due_date.split('T')[0] : '');
    } else if (isOpen) {
      reset({
        project_id: defaultProjectId ? String(defaultProjectId) : '',
        branch_id: '',
        title: '',
        description: '',
        status: 'todo',
        priority: 'normal',
        due_date: '',
      });
    }
  }, [task, isOpen, defaultProjectId, reset, setValue]);

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (isEditing && task) {
        return taskService.update(task.id, {
          branch_id: data.branch_id ? Number(data.branch_id) : null,
          title: data.title,
          description: data.description || undefined,
          status: data.status as TaskStatus,
          priority: data.priority as TaskPriority,
          due_date: data.due_date || null,
        });
      } else {
        return taskService.create({
          project_id: Number(data.project_id),
          branch_id: data.branch_id ? Number(data.branch_id) : null,
          title: data.title,
          description: data.description || undefined,
          status: data.status as TaskStatus,
          priority: data.priority as TaskPriority,
          due_date: data.due_date || null,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      reset();
      onClose();
    },
  });

  const onSubmit = handleSubmit((data) => mutation.mutate(data));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Task' : 'Add Task'}
      size="md"
      id="modal-task"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <FormGroup>
          <Label htmlFor="task-project" required>Project</Label>
          <Select id="task-project" {...register('project_id')} disabled={isEditing}>
            <option value="">Select project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </Select>
          <ErrorMessage message={errors.project_id?.message} />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="task-branch">Git Branch (Optional)</Label>
          <Select id="task-branch" {...register('branch_id')} disabled={!selectedProjectId}>
            <option value="">No branch associated</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup>
          <Label htmlFor="task-title" required>Task Title</Label>
          <Input id="task-title" placeholder="e.g. Update fitur adjustment permintaan barang non medis" {...register('title')} />
          <ErrorMessage message={errors.title?.message} />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="task-desc">Description</Label>
          <Textarea id="task-desc" placeholder="Task requirements or details..." {...register('description')} />
        </FormGroup>

        <div className="grid grid-cols-3 gap-3">
          <FormGroup>
            <Label htmlFor="task-status" required>Status</Label>
            <Select id="task-status" {...register('status')}>
              <option value="todo">Todo</option>
              <option value="in_progress">In Progress</option>
              <option value="testing">Testing</option>
              <option value="done">Done</option>
              <option value="cancelled">Cancelled</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="task-priority" required>Priority</Label>
            <Select id="task-priority" {...register('priority')}>
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="task-duedate">Due Date</Label>
            <Input id="task-duedate" type="date" {...register('due_date')} />
          </FormGroup>
        </div>

        {mutation.isError && (
          <p className="text-sm text-red-400">Failed to save task.</p>
        )}

        <div className="flex gap-3 justify-end pt-2 border-t border-[#252a38]">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={mutation.isPending} id="btn-submit-task">
            {isEditing ? 'Save Changes' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
