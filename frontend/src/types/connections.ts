export type ConnectionProvider = "AWS" | "GCP";

export interface Connection {
  id: number;
  name: string;
  provider: ConnectionProvider;
  created_at: string;
}

export interface CreateConnectionDTO {
  name: string;
  provider: ConnectionProvider;
  credentials: string;
}