import type { IConfigConnector, IWritableConnector, LdesShape } from '@treecg/ldes-types';

export class DummyConnector implements IWritableConnector {
  private readonly members: any[];

  /**
   * Templates for the backend generator.
   */
  public static composeTemplate = ``;

  public static helmTemplate = ``;

  public constructor(config: IConfigConnector, shape: LdesShape, id: string) {
    this.members = [];
    console.log('Shape:');
    console.dir(shape);
  }

  /**
   * Writes a version to the corresponding backend system
   * @param member
   */
  public async writeVersion(member: any): Promise<void> {
    this.members.push(member);
    console.log('Number of processed events:', this.members.length);
  }

  /**
   * Initializes the backend system by creating tables, counters and/or enabling plugins
   */
  public async provision(): Promise<void> {
    // Nothing to provision here
  }

  /**
   * Stops asynchronous operations
   */
  public async stop(): Promise<void> {
    //
  }
}
