'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Label, FormGroup, ErrorMessage } from '@/components/ui/FormFields';
import { projectService } from '@/services/projectService';
import type { Project } from '@/types';

const schema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  repository_url: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project | null;
}

export function ProjectModal({ isOpen, onClose, project }: ProjectModalProps) {
  const queryClient = useQueryClient();
  const isEditing = !!project;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (project && isOpen) {
      setValue('name', project.name);
      setValue('description', project.description || '');
      setValue('repository_url', project.repository_url || '');
    } else if (isOpen) {
      reset({ name: '', description: '', repository_url: '' });
    }
  }, [project, isOpen, reset, setValue]);

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (isEditing && project) {
        return projectService.update(project.id, {
          name: data.name,
          description: data.description || undefined,
          repository_url: data.repository_url || undefined,
        });
      } else {
        return projectService.create({
          name: data.name,
          description: data.description || undefined,
          repository_url: data.repository_url || undefined,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
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
      title={isEditing ? 'Edit Project' : 'Add Project'}
      size="md"
      id="modal-project"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <FormGroup>
          <Label htmlFor="project-name" required>Project Name</Label>
          <Input id="project-name" placeholder="e.g. Warehouse" {...register('name')} />
          <ErrorMessage message={errors.name?.message} />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="project-desc">Description</Label>
          <Textarea id="project-desc" placeholder="Brief project overview..." {...register('description')} />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="project-repo">Repository URL</Label>
          <Input id="project-repo" placeholder="https://github.com/company/repo" {...register('repository_url')} />
        </FormGroup>

        {mutation.isError && (
          <p className="text-sm text-red-400">Failed to save project.</p>
        )}

        <div className="flex gap-3 justify-end pt-2 border-t border-[#252a38]">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={mutation.isPending} id="btn-submit-project">
            {isEditing ? 'Save Changes' : 'Create Project'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
