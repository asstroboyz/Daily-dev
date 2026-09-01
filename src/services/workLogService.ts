import api from '@/lib/api';
import type { ApiResponse, WorkLog, DailyReport } from '@/types';

export type WorkLogFilter = {
  task_id?: number;
  branch_id?: number;
  project_id?: number;
  date?: string;
  date_from?: string;
  date_to?: string;
};

export const workLogService = {
  getAll: async (filter?: WorkLogFilter): Promise<WorkLog[]> => {
    const { data } = await api.get<ApiResponse<WorkLog[]>>('/work-logs', { params: filter });
    return data.data;
  },

  getById: async (id: number): Promise<WorkLog> => {
    const { data } = await api.get<ApiResponse<WorkLog>>(`/work-logs/${id}`);
    return data.data;
  },

  create: async (payload: {
    task_id: number;
    branch_id?: number | null;
    work_date: string;
    title: string;
    description?: string;
    result?: string;
    blocker?: string;
    next_plan?: string;
  }): Promise<WorkLog> => {
    const { data } = await api.post<ApiResponse<WorkLog>>('/work-logs', payload);
    return data.data;
  },

  update: async (id: number, payload: {
    branch_id?: number | null;
    work_date: string;
    title: string;
    description?: string;
    result?: string;
    blocker?: string;
    next_plan?: string;
  }): Promise<WorkLog> => {
    const { data } = await api.put<ApiResponse<WorkLog>>(`/work-logs/${id}`, payload);
    return data.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/work-logs/${id}`);
  },

  uploadAttachment: async (workLogId: number, file: File): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);
    await api.post(`/work-logs/${workLogId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  deleteAttachment: async (id: number): Promise<void> => {
    await api.delete(`/attachments/${id}`);
  },
};

export const reportService = {
  getDaily: async (date: string): Promise<DailyReport> => {
    const { data } = await api.get<ApiResponse<DailyReport>>('/reports/daily', { params: { date } });
    return data.data;
  },
};
