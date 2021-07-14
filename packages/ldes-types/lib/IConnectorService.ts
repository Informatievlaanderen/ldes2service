import type { IOrchestrator } from './IOrchestrator';

export interface IConnectorService {
  id: string;
  name: string;
  type: string;
  image: string;
  port: number;
  config: any;
  createdAt?: string;
  updatedAt?: string;
  orchestrators?: IOrchestrator[];
}
