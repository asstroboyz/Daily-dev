import api from '@/lib/api';
import type { ApiResponse, Task, TaskPriority, TaskStatus } from '@/types';

export type TaskFilter = {
  search?: string;
  project_id?: number;
  branch_id?: number;
  status?: TaskStatus | '';
  priority?: TaskPriority | '';
};

export const taskService = {
  getAll: async (filter?: TaskFilter): Promise<Task[]> => {
    const { data } = await api.get<ApiResponse<Task[]>>('/tasks', { params: filter });
    return data.data;
  },

  getById: async (id: number): Promise<Task> => {
    const { data } = await api.get<ApiResponse<Task>>(`/tasks/${id}`);
    return data.data;
  },

  create: async (payload: {
    project_id: number;
    branch_id?: number | null;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    due_date?: string | null;
  }): Promise<Task> => {
    const { data } = await api.post<ApiResponse<Task>>('/tasks', payload);
    return data.data;
  },

  update: async (id: number, payload: {
    branch_id?: number | null;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    due_date?: string | null;
  }): Promise<Task> => {
    const { data } = await api.put<ApiResponse<Task>>(`/tasks/${id}`, payload);
    return data.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },
};
