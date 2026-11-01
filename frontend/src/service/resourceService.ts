import { api } from "./api";
import type { Resource } from "../types/resources";

export async function getResources(): Promise<Resource[]> {
  const response = await api.get<Resource[]>("/resources");
  return response.data;
}
