'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea, Label, FormGroup, ErrorMessage } from '@/components/ui/FormFields';
import { branchService } from '@/services/branchService';
import { projectService } from '@/services/projectService';
import type { Branch, BranchStatus } from '@/types';

const schema = z.object({
  project_id: z.string().min(1, 'Project is required'),
  name: z.string().min(1, 'Branch name is required'),
  base_branch: z.string().optional(),
  purpose: z.string().optional(),
  status: z.enum(['planned', 'in_progress', 'testing', 'ready_to_merge', 'merged', 'abandoned']),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface BranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  branch?: Branch | null;
  defaultProjectId?: number;
}

export function BranchModal({ isOpen, onClose, branch, defaultProjectId }: BranchModalProps) {
  const queryClient = useQueryClient();
  const isEditing = !!branch;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'in_progress', base_branch: 'development' },
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: projectService.getAll,
    enabled: isOpen,
  });

  useEffect(() => {
    if (branch && isOpen) {
      setValue('project_id', String(branch.project_id));
      setValue('name', branch.name);
      setValue('base_branch', branch.base_branch || '');
      setValue('purpose', branch.purpose || '');
      setValue('status', branch.status);
      setValue('notes', branch.notes || '');
    } else if (isOpen) {
      reset({
        project_id: defaultProjectId ? String(defaultProjectId) : '',
        name: '',
        base_branch: 'development',
        purpose: '',
        status: 'in_progress',
        notes: '',
      });
    }
  }, [branch, isOpen, defaultProjectId, reset, setValue]);

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (isEditing && branch) {
        return branchService.update(branch.id, {
          name: data.name,
          base_branch: data.base_branch || undefined,
          purpose: data.purpose || undefined,
          status: data.status as BranchStatus,
          notes: data.notes || undefined,
        });
      } else {
        return branchService.create({
          project_id: Number(data.project_id),
          name: data.name,
          base_branch: data.base_branch || undefined,
          purpose: data.purpose || undefined,
          status: data.status as BranchStatus,
          notes: data.notes || undefined,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
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
      title={isEditing ? 'Edit Branch' : 'Add Branch'}
      size="md"
      id="modal-branch"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <FormGroup>
          <Label htmlFor="branch-project" required>Project</Label>
          <Select id="branch-project" {...register('project_id')} disabled={isEditing}>
            <option value="">Select project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </Select>
          <ErrorMessage message={errors.project_id?.message} />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="branch-name" required>Branch Name</Label>
          <Input id="branch-name" placeholder="e.g. feature/adjustment-permintaan-non-medis" {...register('name')} />
          <ErrorMessage message={errors.name?.message} />
        </FormGroup>

        <div className="grid grid-cols-2 gap-3">
          <FormGroup>
            <Label htmlFor="branch-base">Base Branch</Label>
            <Input id="branch-base" placeholder="e.g. development, main" {...register('base_branch')} />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="branch-status" required>Status</Label>
            <Select id="branch-status" {...register('status')}>
              <option value="planned">Planned</option>
              <option value="in_progress">In Progress</option>
              <option value="testing">Testing</option>
              <option value="ready_to_merge">Ready to Merge</option>
              <option value="merged">Merged</option>
              <option value="abandoned">Abandoned</option>
            </Select>
          </FormGroup>
        </div>

        <FormGroup>
          <Label htmlFor="branch-purpose">Purpose</Label>
          <Textarea id="branch-purpose" placeholder="Why was this branch created?" {...register('purpose')} />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="branch-notes">Notes</Label>
          <Textarea id="branch-notes" placeholder="Additional notes or context..." {...register('notes')} />
        </FormGroup>

        {mutation.isError && (
          <p className="text-sm text-red-400">Failed to save branch.</p>
        )}

        <div className="flex gap-3 justify-end pt-2 border-t border-[#252a38]">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={mutation.isPending} id="btn-submit-branch">
            {isEditing ? 'Save Changes' : 'Create Branch'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
