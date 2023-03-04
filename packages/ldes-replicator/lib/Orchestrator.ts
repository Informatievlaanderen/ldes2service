import type {
  IState,
  IWritableConnector,
  IConnectorConfig,
  LdesObject,
  LdesObjects,
  ConnectorConfigs,
} from '@treecg/ldes-types';

/**
 * An Orchestrator will handle the synchronization of the Linked Data Event Stream.
 */
export class Orchestrator {
  private readonly stateStore: IState;
  private readonly ldesObjects: LdesObjects;
  private readonly ldesConnectors: Map<LdesObject, IWritableConnector[]> = new Map();
  private readonly connectorsConfig: ConnectorConfigs;

  public constructor(stateStore: IState, ldesObjects: LdesObjects, connectorsConfig: ConnectorConfigs) {
    this.stateStore = stateStore;
    this.ldesObjects = ldesObjects;
    this.connectorsConfig = connectorsConfig;
  }

  /**
   * Start listening to the events and pipe them to the connectors
   */
  public async run(): Promise<void[]> {
    console.debug('START RUN');

    const runs = Array.from(this.ldesConnectors.keys()).map(ldesObject => {
      const connectors = this.ldesConnectors.get(ldesObject);

      if (!connectors) {
        return;
      }

      return new Promise<void>(async (resolve, reject) => {
        ldesObject.stream.on('readable', async () => {
          await this.writeMembers(ldesObject, connectors);
        }).on('error', error => reject(error))
          .on('end', () => resolve());
      });
    });

    return Promise.all(runs);
  }

  public async provision(): Promise<void> {
    const promises: Promise<void>[] = [];
    const state = this.stateStore.provision();

    Object.values(this.ldesObjects).forEach(ldesObject => {
      const ldesConnectors: IWritableConnector[] = Object.values(this.connectorsConfig).map(
        (con: IConnectorConfig) => {
          const config = con.settings || {};
          const Connector = require(con.type || '@ldes/ldes-dummy-connector');

          const connectorName = Object.keys(Connector).find(key => key.endsWith('Connector'));

          if (!connectorName) {
            throw new Error(`The connector ${con.type} couldn't be loaded correctly!`);
          }

          const connector = new Connector[connectorName](config, ldesObject.shape, ldesObject.name);

          promises.push(connector.provision());

          return connector;
        },
      );

      this.ldesConnectors.set(ldesObject, ldesConnectors);
    });

    await Promise.all([state, ...promises]);

    console.debug('END PROVISION');
  }

  /**
   * Reset the state
   */
  public reset(): Promise<void> {
    throw new Error('not implemented');
  }

  protected async writeMembers(ldesIterator: LdesObject, connectors: IWritableConnector[]): Promise<void> {
    let member = ldesIterator.stream.read();

    while (member) {
      const memberRef = member;
      await Promise.all(connectors.map(con => con.writeVersion(memberRef)));
      member = ldesIterator.stream.read();
    }
  }
}
