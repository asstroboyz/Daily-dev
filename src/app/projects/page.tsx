'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Plus, FolderKanban, ExternalLink, Edit2, Trash2, GitBranch, CheckSquare } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/States';
import { ConfirmDialog } from '@/components/ui/Modal';
import { ProjectModal } from '@/features/projects/ProjectModal';
import { projectService } from '@/services/projectService';
import { branchService } from '@/services/branchService';
import { taskService } from '@/services/taskService';
import type { Project } from '@/types';

export default function ProjectsPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);

  const { data: projects = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['projects'],
    queryFn: projectService.getAll,
  });

  const { data: branches = [] } = useQuery({
    queryKey: ['branches'],
    queryFn: () => branchService.getAll(),
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => taskService.getAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => projectService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setDeletingProject(null);
    },
  });

  if (isLoading) return <LoadingState label="Loading projects..." />;
  if (isError) return <ErrorState message="Failed to load projects" onRetry={refetch} />;

  return (
    <div>
      <PageHeader
        title="Projects"
        description="Manage projects and repositories"
        actions={
          <Button
            id="btn-add-project"
            onClick={() => {
              setEditingProject(null);
              setModalOpen(true);
            }}
          >
            <Plus size={16} />
            Add Project
          </Button>
        }
      />

      {projects.length === 0 ? (
        <EmptyState
          title="No projects found"
          description="Create your first project to start tracking branches and tasks."
          action={
            <Button onClick={() => setModalOpen(true)}>
              <Plus size={16} />
              Add Project
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => {
            const projectBranches = branches.filter((b) => b.project_id === project.id && b.status !== 'merged' && b.status !== 'abandoned');
            const projectTasks = tasks.filter((t) => t.project_id === project.id && t.status !== 'done' && t.status !== 'cancelled');

            return (
              <div
                key={project.id}
                className="bg-[#13161e] border border-[#252a38] hover:border-[#6366f1]/50 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-lg text-[#e8eaf0] group-hover:text-[#6366f1] transition-colors">
                      <Link href={`/projects/${project.id}`}>{project.name}</Link>
                    </h3>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingProject(project);
                          setModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-[#8b91a8] hover:text-[#e8eaf0] hover:bg-[#252a38]"
                        title="Edit Project"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => setDeletingProject(project)}
                        className="p-1.5 rounded-lg text-[#8b91a8] hover:text-red-400 hover:bg-red-500/10"
                        title="Delete Project"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-[#8b91a8] line-clamp-2 mb-4">
                    {project.description || 'No description provided.'}
                  </p>

                  {project.repository_url && (
                    <a
                      href={project.repository_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-[#525870] hover:text-[#6366f1] transition-colors mb-4 truncate max-w-full"
                    >
                      <ExternalLink size={12} />
                      {project.repository_url.replace(/^https?:\/\//, '')}
                    </a>
                  )}
                </div>

                <div className="pt-4 border-t border-[#252a38] flex items-center justify-between text-xs text-[#8b91a8]">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                      <GitBranch size={14} className="text-[#6366f1]" />
                      <strong className="text-[#e8eaf0]">{projectBranches.length}</strong> active branches
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CheckSquare size={14} className="text-[#22c55e]" />
                      <strong className="text-[#e8eaf0]">{projectTasks.length}</strong> open tasks
                    </span>
                  </div>

                  <Link
                    href={`/projects/${project.id}`}
                    className="text-[#6366f1] hover:underline font-medium"
                  >
                    View &rarr;
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ProjectModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingProject(null);
        }}
        project={editingProject}
      />

      <ConfirmDialog
        isOpen={!!deletingProject}
        onClose={() => setDeletingProject(null)}
        onConfirm={() => deletingProject && deleteMutation.mutate(deletingProject.id)}
        title={`Delete "${deletingProject?.name}"?`}
        description="This will mark the project as deleted."
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
