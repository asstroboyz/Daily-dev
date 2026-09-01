import api from '@/lib/api';
import type { ApiResponse, Branch, BranchStatus } from '@/types';

export type BranchFilter = {
  search?: string;
  project_id?: number;
  status?: BranchStatus | '';
};

export const branchService = {
  getAll: async (filter?: BranchFilter): Promise<Branch[]> => {
    const { data } = await api.get<ApiResponse<Branch[]>>('/branches', { params: filter });
    return data.data;
  },

  getById: async (id: number): Promise<Branch> => {
    const { data } = await api.get<ApiResponse<Branch>>(`/branches/${id}`);
    return data.data;
  },

  create: async (payload: {
    project_id: number;
    name: string;
    base_branch?: string;
    purpose?: string;
    status: BranchStatus;
    notes?: string;
  }): Promise<Branch> => {
    const { data } = await api.post<ApiResponse<Branch>>('/branches', payload);
    return data.data;
  },

  update: async (id: number, payload: {
    name: string;
    base_branch?: string;
    purpose?: string;
    status: BranchStatus;
    notes?: string;
  }): Promise<Branch> => {
    const { data } = await api.put<ApiResponse<Branch>>(`/branches/${id}`, payload);
    return data.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/branches/${id}`);
  },
};
