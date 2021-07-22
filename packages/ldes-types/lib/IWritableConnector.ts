import { LdesShape } from './LdesShape';

export interface IWritableConnector {
  /**
   * Sets the shape to the connector
   * @param member
   */
  setShape: (shape?: LdesShape) => void;

  /**
   * Writes a version to the corresponding backend system
   * @param member
   */
  writeVersion: (member: any) => Promise<void>;

  /**
   * Initializes the backend system by creating tables, counters and/or enabling plugins
   */
  provision: () => Promise<void>;

  /**
   * Stops asynchronous operations
   */
  stop: () => Promise<void>;
}
