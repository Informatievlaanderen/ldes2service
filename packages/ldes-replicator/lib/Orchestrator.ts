import type { Readable } from 'stream';
import type { IState, IWritableConnector, LdesObjects } from '@ldes/types';

/**
 * An Orchestrator will handle the synchronization of the Linked Data Event Stream.
 */
export class Orchestrator {
  private readonly connectors: IWritableConnector[];
  private readonly stateStore: IState;
  private readonly ldes: LdesObjects;

  public constructor(connectors: IWritableConnector[], stateStore: IState, ldes: LdesObjects) {
    this.connectors = connectors;
    this.stateStore = stateStore;
    this.ldes = ldes;
  }

  /**
   * Start listening to the events and pipe them to the connectors
   */
  public async run(): Promise<void[]> {
    return Promise.all(
      Object.values(this.ldes).map(
        ldes =>
          new Promise<void>((resolve, reject) => {
            ldes.stream
              .on('readable', () => {
                //console.log({ clement: ldes });

                this.processData(ldes.stream);
              })
              .on('error', error => reject(error));

            ldes.stream.on('end', () => resolve());
          })
      )
    );
  }

  public async provision(): Promise<void> {
    const state = this.stateStore.provision();
    Object.values(this.ldes).forEach(ldes => this.connectors.forEach(con => con.setShape(ldes.shape)));
    const connectors = Promise.all(this.connectors.map(con => con.provision()));

    await Promise.all([state, connectors]);
  }

  /**
   * Reset the state
   */
  public reset(): Promise<void> {
    throw new Error('not implemented');
  }

  protected async processData(ldes: Readable): Promise<void> {
    let member: string = ldes.read();
    while (member) {
      const copiedMember = member;
      await Promise.all(this.connectors.map(con => con.writeVersion(copiedMember)));
      member = ldes.read();
    }
  }
}
