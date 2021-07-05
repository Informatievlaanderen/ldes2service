import type { Url } from 'url';

export interface IState {
  /**
   * Create tables for projection status, init counters, enable necessary plugins
   */
  provision: () => Promise<void>;

  /**
   * Return the latest processed page
   */
  getLatestPage: () => Promise<Url>;

  /**
   * Return all processed pages
   */
  getProcessedPaged: () => Promise<Url[]>;
}
