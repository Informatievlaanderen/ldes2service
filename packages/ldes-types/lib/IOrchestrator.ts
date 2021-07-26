export interface IOrchestrator {
  id: string;
  ldes_uri: string;
  polling_interval: number;
  name: string;
  slug: string;
  createdAt?: string;
  updatedAt?: string;
}
