import { Orchestrator } from '@ldes/replicator';
import { newEngine } from '@treecg/actor-init-ldes-client';

import type { IQueryServiceConfig, IReplicatorConfig } from './Manager';

export class QueryService {
  public readonly name: string;
  private readonly replicators: Record<string, Orchestrator>;

  public constructor(
    private readonly config: IQueryServiceConfig,
    private readonly connector: any,
    private readonly state: any
  ) {
    this.name = config.name;
  }

  public async addReplicator(config: IReplicatorConfig): Promise<void> {
    const options = {
      pollingInterval: config.pollingInterval,
    };
    const state = new this.state();

    const connector = new this.connector(this.config.settings);

    const LDESClient = newEngine();
    const eventstreamSync = LDESClient.createReadStream(config.url, options);

    const orchestrator = new Orchestrator([this.connector], state, [eventstreamSync]);

    await orchestrator.provision();

    this.replicators[config.name] = orchestrator;
    console.log(`Replicator ${config.name} added.`);
  }

  public async provision(): Promise<void> {
    await Promise.all(this.config.replicators.map(conf => this.addReplicator(conf)));
  }

  public async run(): Promise<void> {
    await Promise.all(Object.values(this.replicators).map(rep => rep.run()));
  }
}
