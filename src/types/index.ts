export type ApiResponse<T> = {
  status: boolean;
  message: string;
  errors: unknown;
  data: T;
};

export type Project = {
  id: number;
  name: string;
  description: string | null;
  repository_url: string | null;
  created_at: string;
  updated_at: string;
};

export type BranchStatus =
  | 'planned'
  | 'in_progress'
  | 'testing'
  | 'ready_to_merge'
  | 'merged'
  | 'abandoned';

export type Branch = {
  id: number;
  project_id: number;
  project: Project;
  name: string;
  base_branch: string | null;
  purpose: string | null;
  status: BranchStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type TaskStatus = 'todo' | 'in_progress' | 'testing' | 'done' | 'cancelled';
export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent';

export type Task = {
  id: number;
  project_id: number;
  branch_id: number | null;
  project: Project;
  branch: Branch | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  work_logs?: WorkLog[];
};

export type Attachment = {
  id: number;
  work_log_id: number;
  file_name: string;
  original_file_name: string;
  storage_path: string;
  file_url: string;
  mime_type: string | null;
  file_size: number | null;
  created_at: string;
};

export type WorkLog = {
  id: number;
  task_id: number;
  branch_id: number | null;
  task: Task;
  branch: Branch | null;
  work_date: string;
  title: string;
  description: string | null;
  result: string | null;
  blocker: string | null;
  next_plan: string | null;
  created_at: string;
  updated_at: string;
  attachments: Attachment[];
};

export type DailyReportWorkLogSummary = {
  id: number;
  title: string;
};

export type DailyReportTaskGroup = {
  task_id: number;
  task_title: string;
  task_status: string;
  branch_name: string | null;
  work_logs: DailyReportWorkLogSummary[];
};

export type DailyReportProjectGroup = {
  project_id: number;
  project_name: string;
  tasks: DailyReportTaskGroup[];
};

export type DailyReport = {
  date: string;
  projects: DailyReportProjectGroup[];
};
