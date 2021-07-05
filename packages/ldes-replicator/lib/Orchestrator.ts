import type { Readable } from 'stream';
import type { IState, IWritableConnector } from '@ldes/types';

/**
 * An Orchestrator will handle the synchronization of the Linked Data Event Stream.
 * It initializes the connectors
 */
export class Orchestrator {
  private readonly connectors: IWritableConnector[];
  private readonly stateStore: IState;
  private readonly ldes: Readable;

  public constructor(connectors: IWritableConnector[], stateStore: IState, ldes: Readable) {
    this.connectors = connectors;
    this.stateStore = stateStore;
    this.ldes = ldes;
  }

  /**
   * Start listening to the events and pipe them to the connectors
   */
  public run(): void {
    throw new Error('not implemented');
  }

  /**
   * Run provision function of all connectors
   */
  public provision(): void {
    throw new Error('not implemented');
  }

  /**
   * Reset the state
   */
  public reset(): void {
    throw new Error('not implemented');
  }
}
