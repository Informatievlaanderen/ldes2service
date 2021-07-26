import type { Readable } from 'stream';
import type { IState, IWritableConnector, LdesObjects } from '@ldes/types';

/**
 * An Orchestrator will handle the synchronization of the Linked Data Event Stream.
 */
export class Orchestrator {
  private readonly stateStore: IState;
  private readonly ldesObjects: LdesObjects;
  private ldesConnectors: Map<Readable, IWritableConnector[]> = new Map();

  public constructor(stateStore: IState, ldesObjects: LdesObjects) {
    this.stateStore = stateStore;
    this.ldesObjects = ldesObjects;
  }

  /**
   * Start listening to the events and pipe them to the connectors
   */
  public async run(): Promise<void[]> {
    const runs = Array.from(this.ldesConnectors.keys()).map(stream => {
      new Promise<void>((resolve, reject) => {
        stream
          .on('readable', () => {
            // @ts-ignore
            console.debug('Connectors : ', [this.ldesConnectors.get(stream)?.map(x => x.config)]);
            this.processData(stream, this.ldesConnectors.get(stream)!);
          })
          .on('error', error => reject(error));

        stream.on('end', () => resolve());
      });
    });

    return Promise.all(runs);
  }

  public async provision(): Promise<void> {
    const promises: Promise<void>[] = [];
    const state = this.stateStore.provision();
    const connectors = JSON.parse(process.env.CONNECTORS || '[]');

    Object.values(this.ldesObjects).forEach(ldesObject => {
      const ldesConnectors: IWritableConnector[] = connectors.map((con: string) => {
        const config = JSON.parse(process.env[`CONNECTOR_${con}_CONFIG`] || '{}');
        const Connector = require(process.env[`CONNECTOR_${con}_TYPE`] || '@ldes/ldes-dummy-connector');

        const connectorName = Object.keys(Connector).find(key => key.endsWith('Connector'));

        if (!connectorName) {
          throw new Error(`The connector ${con} couldn't be loaded correctly!`);
        }

        const connector = new Connector[connectorName](config, ldesObject.shape, ldesObject.name);

        promises.push(connector.provision());

        return connector;
      });

      // @ts-ignore
      // console.log({ ldesObject, ldesConnectors: ldesConnectors.map(x => x.config) })

      this.ldesConnectors.set(ldesObject.stream, ldesConnectors);
    });

    // console.log({promises});

    try {
      await Promise.all([state, ...promises]);
    } catch (e: any) {
      console.error(e);
    }

    console.log(Array.from(this.ldesConnectors.values()));
    // @ts-ignore
    console.debug('LDES CONNECTORS', [Array.from(this.ldesConnectors.values()).map(x => x[1].config)]);
  }

  /**
   * Reset the state
   */
  public reset(): Promise<void> {
    throw new Error('not implemented');
  }

  protected async processData(ldes: Readable, connectors: IWritableConnector[]): Promise<void> {
    let member: string = ldes.read();

    // console.log("processData");
    // @ts-ignore
    // console.log({ connectors, member, tables: connectors.map(con => con.config.table) })

    while (member) {
      const copiedMember = member;
      await Promise.all(connectors.map(con => con.writeVersion(copiedMember)));

      // @ts-ignore
      member = null;
      // member = ldes.read();
    }
  }
}
