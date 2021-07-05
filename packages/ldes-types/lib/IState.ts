import type { Url } from 'url';

export interface IState {
  /**
   * Create tables for projection status, init counters, enable necessary plugins
   */
  provision: () => Promise<void>;

  /*
   * Mark this page as the latest one that was processed
   */
  setLatestPage: (page: Url) => Promise<void>;

  /**
   * Return the latest processed page
   */
  getLatestPage: () => Promise<Url | null>;

  /**
   * Return all processed pages
   */
  getProcessedPaged: () => Promise<Url[]>;
}
