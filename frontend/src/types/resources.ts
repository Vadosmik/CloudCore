export type ResourceType =
  | "COMPUTE"
  | "DATABASE"
  | "STORAGE"
  | "NETWORK"
  | "OTHER";
export type ResourceStatus = "RUNNING" | "STOPPED" | "TERMINATED" | "UNKNOWN";

export interface Resource {
  id: number;
  external_id: string;
  connection_id: number;
  name: string;
  resource_type: ResourceType;
  provider_type: string;
  region: string | null;
  status: ResourceStatus;
  last_seen_at: string;
  created_at: string;
}
