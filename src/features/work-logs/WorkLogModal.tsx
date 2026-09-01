'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea, Label, FormGroup, ErrorMessage } from '@/components/ui/FormFields';
import { projectService } from '@/services/projectService';
import { taskService } from '@/services/taskService';
import { workLogService } from '@/services/workLogService';
import { branchService } from '@/services/branchService';
import { today } from '@/lib/utils';
import { Paperclip, X } from 'lucide-react';

const schema = z.object({
  project_id: z.string().min(1, 'Project is required'),
  task_id: z.string().min(1, 'Task is required'),
  branch_id: z.string().optional(),
  work_date: z.string().min(1, 'Work date is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  result: z.string().optional(),
  blocker: z.string().optional(),
  next_plan: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface WorkLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId?: number;   // pre-select task
  onSuccess?: () => void;
}

export function WorkLogModal({ isOpen, onClose, taskId, onSuccess }: WorkLogModalProps) {
  const queryClient = useQueryClient();
  const [files, setFiles] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { work_date: today() },
  });

  const selectedProjectId = watch('project_id');
  const selectedTaskId = watch('task_id');

  // Queries
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: projectService.getAll,
    enabled: isOpen,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', selectedProjectId],
    queryFn: () => taskService.getAll({ project_id: selectedProjectId ? Number(selectedProjectId) : undefined }),
    enabled: isOpen && !!selectedProjectId,
  });

  const { data: branches = [] } = useQuery({
    queryKey: ['branches', selectedProjectId],
    queryFn: () => branchService.getAll({ project_id: selectedProjectId ? Number(selectedProjectId) : undefined }),
    enabled: isOpen && !!selectedProjectId,
  });

  // Auto-fill branch from selected task
  useEffect(() => {
    if (selectedTaskId && tasks.length) {
      const task = tasks.find((t) => t.id === Number(selectedTaskId));
      if (task?.branch_id) {
        setValue('branch_id', String(task.branch_id));
      }
    }
  }, [selectedTaskId, tasks, setValue]);

  // Pre-select task if given
  useEffect(() => {
    if (taskId && isOpen) {
      setValue('task_id', String(taskId));
      const task = tasks.find((t) => t.id === taskId);
      if (task) {
        setValue('project_id', String(task.project_id));
        if (task.branch_id) setValue('branch_id', String(task.branch_id));
      }
    }
  }, [taskId, isOpen, tasks, setValue]);

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const wl = await workLogService.create({
        task_id: Number(data.task_id),
        branch_id: data.branch_id ? Number(data.branch_id) : null,
        work_date: data.work_date,
        title: data.title,
        description: data.description || undefined,
        result: data.result || undefined,
        blocker: data.blocker || undefined,
        next_plan: data.next_plan || undefined,
      });

      // Upload attachments
      for (const file of files) {
        await workLogService.uploadAttachment(wl.id, file);
      }
      return wl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-logs'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      reset({ work_date: today() });
      setFiles([]);
      onSuccess?.();
      onClose();
    },
  });

  const handleClose = () => {
    reset({ work_date: today() });
    setFiles([]);
    onClose();
  };

  const onSubmit = handleSubmit((data) => mutation.mutate(data));

  const handleFileAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
    e.target.value = '';
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Work Log" size="lg" id="modal-add-worklog">
      <form onSubmit={onSubmit} className="space-y-4">
        {/* Row 1: Project + Task */}
        <div className="grid grid-cols-2 gap-3">
          <FormGroup>
            <Label htmlFor="wl-project" required>Project</Label>
            <Select id="wl-project" {...register('project_id')} onChange={(e) => {
              setValue('project_id', e.target.value);
              setValue('task_id', '');
              setValue('branch_id', '');
            }}>
              <option value="">Select project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </Select>
            <ErrorMessage message={errors.project_id?.message} />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="wl-task" required>Task</Label>
            <Select id="wl-task" {...register('task_id')} disabled={!selectedProjectId}>
              <option value="">Select task</option>
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </Select>
            <ErrorMessage message={errors.task_id?.message} />
          </FormGroup>
        </div>

        {/* Row 2: Branch + Date */}
        <div className="grid grid-cols-2 gap-3">
          <FormGroup>
            <Label htmlFor="wl-branch">Branch</Label>
            <Select id="wl-branch" {...register('branch_id')} disabled={!selectedProjectId}>
              <option value="">No branch</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </Select>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="wl-date" required>Work Date</Label>
            <Input id="wl-date" type="date" {...register('work_date')} />
            <ErrorMessage message={errors.work_date?.message} />
          </FormGroup>
        </div>

        {/* Title */}
        <FormGroup>
          <Label htmlFor="wl-title" required>Title</Label>
          <Input id="wl-title" placeholder="What did you work on?" {...register('title')} />
          <ErrorMessage message={errors.title?.message} />
        </FormGroup>

        {/* Description */}
        <FormGroup>
          <Label htmlFor="wl-description">Description</Label>
          <Textarea id="wl-description" placeholder="Detail of what was done..." {...register('description')} />
        </FormGroup>

        {/* Result + Blocker */}
        <div className="grid grid-cols-2 gap-3">
          <FormGroup>
            <Label htmlFor="wl-result">Result</Label>
            <Textarea id="wl-result" placeholder="What was the outcome?" {...register('result')} rows={2} />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="wl-blocker">Blocker</Label>
            <Textarea id="wl-blocker" placeholder="Any blockers?" {...register('blocker')} rows={2} />
          </FormGroup>
        </div>

        {/* Next Plan */}
        <FormGroup>
          <Label htmlFor="wl-next-plan">Next Plan</Label>
          <Input id="wl-next-plan" placeholder="What's next?" {...register('next_plan')} />
        </FormGroup>

        {/* Attachments */}
        <FormGroup>
          <Label>Attachments</Label>
          <label className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-[#252a38] text-sm text-[#525870] hover:border-[#6366f1] hover:text-[#6366f1] cursor-pointer transition-colors">
            <Paperclip size={14} />
            Attach files
            <input type="file" multiple className="hidden" onChange={handleFileAdd} />
          </label>
          {files.length > 0 && (
            <div className="mt-2 space-y-1">
              {files.map((f, idx) => (
                <div key={idx} className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#1a1e28] text-xs text-[#8b91a8]">
                  <span className="truncate">{f.name}</span>
                  <button type="button" onClick={() => removeFile(idx)} className="ml-2 text-[#525870] hover:text-red-400">
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </FormGroup>

        {/* Error */}
        {mutation.isError && (
          <p className="text-sm text-red-400">Failed to save. Please try again.</p>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-2 border-t border-[#252a38]">
          <Button type="button" variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button type="submit" loading={mutation.isPending} id="btn-submit-worklog">
            Save Work Log
          </Button>
        </div>
      </form>
    </Modal>
  );
}
