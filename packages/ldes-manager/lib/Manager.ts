import { DummyConnector } from '@ldes/ldes-dummy-connector';
import { DummyState } from '@ldes/ldes-dummy-state';
import { Orchestrator } from '@ldes/replicator';

import { newEngine } from '@treecg/actor-init-ldes-client';

interface IOrchestratorConfig {
  name: string;
  url: string;
  pollingInterval: number;
}

interface IManagerConfig {
  orchestrators: IOrchestratorConfig[];
}

const config = {
  orchestrators: [
    {
      name: 'GentObjecten',
      url: 'https://apidg.gent.be/opendata/adlib2eventstream/v1/dmg/objecten',
      pollingInterval: 5_000,
      integrations: [],
      backends: [],
    },
  ],
};

/**
 * The Manager will, from a set configuration launch a series of Orchestrators and handle their behaviour.
 */
export class Manager {
  private readonly orchestrators: Record<string, Orchestrator>;
  private readonly configuration: IManagerConfig;

  public constructor() {
    this.configuration = config;
  }

  /**
   * Add a new orchestrator to the ones managed by this Manager.
   * @param orchestratorConfig The configuration the orchestrator needs.
   * @private
   */
  private async addOrchestrator(orchestratorConfig: IOrchestratorConfig): Promise<void> {
    const options = {
      pollingInterval: orchestratorConfig.pollingInterval,
    };

    const connector = new DummyConnector();
    const state = new DummyState();

    const LDESClient = newEngine();
    const eventstreamSync = LDESClient.createReadStream(orchestratorConfig.url, options);

    const orchestrator = new Orchestrator([connector], state, eventstreamSync);

    await orchestrator.provision();

    this.orchestrators[orchestratorConfig.name] = orchestrator;
    console.log(`Orchestrator ${orchestratorConfig.name} added.`);
  }

  public async provision(): Promise<void> {
    const orchestratorConfigs = this.configuration.orchestrators;

    await Promise.all(orchestratorConfigs.map(conf => this.addOrchestrator(conf)));
  }

  /**
   * Start listening to events on all Orchestrators.
   */
  public async run(): Promise<void> {
    await Promise.all(Object.values(this.orchestrators).map(orchestrator => orchestrator.run()));
  }
}
