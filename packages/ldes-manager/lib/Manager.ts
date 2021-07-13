import { QueryService } from './QueryService';

export interface IReplicatorConfig {
  name: string;
  url: string;
  pollingInterval: number;
}

export interface IQueryServiceConfig {
  name: string;
  description: string;
  settings: Record<string, any>;
  connector: string;
  replicators: IReplicatorConfig[];
}

export interface IManagerConfig {
  state: any;
  connectors: Record<string, any>;
  queryServices: IQueryServiceConfig[];
}

/**
 * The Manager will, from a set config launch a series of QueryServices and handle their behavior.
 */
export class Manager {
  private readonly queryServices: Record<string, QueryService>;
  private readonly connectors: Record<string, any>;

  public constructor(private readonly config: IManagerConfig) {
    this.connectors = config.connectors;
  }

  public async addQueryService(config: IQueryServiceConfig): Promise<void> {
    if (Object.keys(this.queryServices).includes(config.name)) {
      console.error(`The Query Service ${config.name} already exists!`);
      return;
    }
    if (!Object.keys(this.connectors).includes(config.connector)) {
      console.error(`The Connector ${config.name} doesn't exist!`);
      return;
    }

    const queryService = new QueryService(config, this.connectors[config.connector], this.config.state);

    await queryService.provision();

    this.queryServices[config.name] = queryService;

    console.log(`Query Service ${config.name} added.`);
  }

  public async provision(): Promise<void> {
    const queryServices = this.config.queryServices;

    await Promise.all(queryServices.map(conf => this.addQueryService(conf)));
  }

  /**
   * Start listening to events for all QueryServices.
   */
  public async run(): Promise<void> {
    await Promise.all(Object.values(this.queryServices).map(qs => qs.run()));
  }
}
