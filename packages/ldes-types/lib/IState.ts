import type { Url } from 'url';

export interface IState {
  /**
   * Create tables for projection status, init counters, enable necessary plugins
   */
  provision: () => void;

  /**
   * Return the latest processed page
   */
  getLatestPage: () => Url;

  /**
   * Return all processed pages
   */
  getProcessedPaged: () => Url[];
}
