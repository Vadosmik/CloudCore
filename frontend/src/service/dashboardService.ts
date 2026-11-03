import { api } from "./api";
import type {
  Dashboard,
  DashboardListItem,
  CreateDashboardDTO,
  UpdateDashboardDTO,
} from "../types/dashboards";
import type { ChartLayoutItem } from "../types/charts";

export async function getDashboards(): Promise<DashboardListItem[]> {
  const response = await api.get<DashboardListItem[]>("/dashboards");
  return response.data;
}

export async function getDashboardById(dashboardId: string): Promise<Dashboard> {
  const response = await api.get<Dashboard>(`/dashboards/${dashboardId}`);
  return response.data;
}

export async function createDashboard(dashboard: CreateDashboardDTO): Promise<Dashboard> {
  const response = await api.post<Dashboard>("/dashboards", dashboard);
  return response.data;
}

export async function updateDashboard(
  dashboardId: number,
  dashboard: UpdateDashboardDTO,
): Promise<Dashboard> {
  const response = await api.put<Dashboard>(`/dashboards/${dashboardId}`, dashboard);
  return response.data;
}

export async function updateDashboardLayout(
  dashboardId: number,
  layout: ChartLayoutItem[],
): Promise<void> {
  await api.put(`/dashboards/${dashboardId}/layout`, layout);
}

export async function deleteDashboard(dashboardId: number): Promise<void> {
  await api.delete(`/dashboards/${dashboardId}`);
}
