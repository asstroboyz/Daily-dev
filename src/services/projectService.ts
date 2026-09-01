import api from '@/lib/api';
import type { ApiResponse, Project } from '@/types';

export const projectService = {
  getAll: async (): Promise<Project[]> => {
    const { data } = await api.get<ApiResponse<Project[]>>('/projects');
    return data.data;
  },

  getById: async (id: number): Promise<Project> => {
    const { data } = await api.get<ApiResponse<Project>>(`/projects/${id}`);
    return data.data;
  },

  create: async (payload: { name: string; description?: string; repository_url?: string }): Promise<Project> => {
    const { data } = await api.post<ApiResponse<Project>>('/projects', payload);
    return data.data;
  },

  update: async (id: number, payload: { name: string; description?: string; repository_url?: string }): Promise<Project> => {
    const { data } = await api.put<ApiResponse<Project>>(`/projects/${id}`, payload);
    return data.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },
};
