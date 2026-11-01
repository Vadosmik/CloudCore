import { api } from "./api";
import type { Connection, CreateConnectionDTO } from "../types/connections";


export async function getConnections(): Promise<Connection[]> {
  const response = await api.get<Connection[]>("/connections");
  return response.data;
}


export async function createConnections(connection: CreateConnectionDTO): Promise<CreateConnectionDTO> {
  const response = await api.post<CreateConnectionDTO>("/connections", connection);
  return response.data;
}


export async function deleteConnections(connectionId: number): Promise<void> {
  await api.delete(`/connections/${connectionId}`);
}