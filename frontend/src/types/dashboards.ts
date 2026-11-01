import type { Chart } from "./charts";

export interface DashboardListItem {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Dashboard extends DashboardListItem {
  charts: Chart[];
}

export interface CreateDashboardDTO {
  title: string;
}

export interface UpdateDashboardDTO {
  title?: string;
}