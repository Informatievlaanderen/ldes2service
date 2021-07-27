import type { Url } from 'url';
import type { IState } from '@ldes/types';
import type { WrappedNodeRedisClient } from 'handy-redis';
import { createNodeRedisClient } from 'handy-redis';

export interface IRedisStateConfig {
  id: string;
  host?: string;
  port?: number;
  password?: string;
}

export class RedisState implements IState {
  private client: WrappedNodeRedisClient;
  private readonly settings: IRedisStateConfig;

  public constructor(settings: IRedisStateConfig) {
    this.settings = settings;
  }

  public async getLatestPage(): Promise<Url | null> {
    const pages = await this.getProcessedPages();

    return pages.length > 0 ? pages[pages.length - 1] : null;
  }

  public async setLatestPage(page: Url): Promise<void> {
    const pages = await this.getProcessedPages();
    pages.push(page);

    await this.setPages(pages);
  }

  public async getProcessedPages(): Promise<Url[]> {
    return JSON.parse((await this.client.get(`ldes_${this.settings.id}_pages`)) ?? '[]');
  }

  public async provision(): Promise<void> {
    this.client = createNodeRedisClient({
      host: this.settings.host ?? '127.0.0.1',
      port: this.settings.port ?? 6_379,
      password: this.settings.password ?? '',
    });
  }

  private async setPages(pages: Url[]): Promise<void> {
    await this.client.set(`ldes_${this.settings.id}_pages`, JSON.stringify(pages));
  }
}
