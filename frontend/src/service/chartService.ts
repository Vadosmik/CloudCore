import { api } from "./api";
import type { Chart, CreateChartDTO, UpdateChartDTO } from "../types/charts";

export async function getChart(chartId: number): Promise<Chart> {
  const response = await api.get<Chart>(`/charts/${chartId}`);
  return response.data;
}

export async function createChart(chart: CreateChartDTO): Promise<Chart> {
  const response = await api.post<Chart>("/charts", chart);
  return response.data;
}

export async function updateChart(chartId: number, chart: Partial<UpdateChartDTO>): Promise<Chart> {
  const response = await api.put<Chart>(`/charts/${chartId}`, chart);
  return response.data;
}

export async function deleteChart(chartId: number): Promise<void> {
  await api.delete(`/charts/${chartId}`);
}
