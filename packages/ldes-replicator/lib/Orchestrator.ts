import type { Readable } from 'stream';
import type { IState, IWritableConnector } from '@ldes/types';

/**
 * An Orchestrator will handle the synchronization of the Linked Data Event Stream.
 */
export class Orchestrator {
  private readonly connectors: IWritableConnector[];
  private readonly stateStore: IState;
  private readonly ldes: Readable[];

  public constructor(connectors: IWritableConnector[], stateStore: IState, ldes: Readable[]) {
    this.connectors = connectors;
    this.stateStore = stateStore;
    this.ldes = ldes;
  }

  /**
   * Start listening to the events and pipe them to the connectors
   */
  public async run(): Promise<void[]> {
    return Promise.all(
      this.ldes.map(
        ldes =>
          new Promise<void>((resolve, reject) => {
            ldes.on('readable', () => this.processData(ldes)).on('error', error => reject(error));
            ldes.on('end', () => resolve());
          })
      )
    );
  }

  public async provision(): Promise<void> {
    const state = this.stateStore.provision();
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
