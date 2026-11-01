import { api } from "./api";
import type { Chart, CreateChartDTO } from "../types/charts";

export async function createChart(chart: CreateChartDTO): Promise<Chart> {
  const response = await api.post<Chart>("/charts", chart);
  return response.data;
}

export async function deleteChart(chartId: number): Promise<void> {
  await api.delete(`/charts/${chartId}`);
}
