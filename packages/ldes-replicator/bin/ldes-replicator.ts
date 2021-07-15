/**
 * CLI interface where manual dependency injection happens
 */

import { PostgresConnector } from '@ldes/ldes-postgres-connector';
import { RedisState } from '@ldes/ldes-redis-state';

import { newEngine } from '@treecg/actor-init-ldes-client';
import { Orchestrator } from '../lib/Orchestrator';

// TODO: Parse and use CLI parameters

const URLS = process.env.URLS;
const POLL_INTERVAL = Number.parseInt(process.env.pollingInterval ?? '5000', 10);

async function run(): Promise<void> {
  const config = {
    amountOfVersions: 0,
    databaseName: 'ldes',
    username: process.env.POSTGRES_USERNAME ?? 'postgres',
    password: process.env.POSTGRES_PASSWORD ?? 'postgres',
    database: process.env.POSTGRES_DATABASE ?? 'postgres',
    hostname: process.env.POSTGRES_HOSTNAME ?? '127.0.0.1',
    port: Number.parseInt(process.env.POSTGRES_PORT ?? '5432', 10),
  };

  const connector = new PostgresConnector(config);
  const state = new RedisState({
    id: 'replicator',
  });

  const options = {
    pollingInterval: POLL_INTERVAL,
  };

  if (!URLS) {
    throw new Error('No LDES URLs specified. Have you added the URL environment variable?');
  }

  const LDESClient = newEngine();

  const streams = URLS.split(',').map(url => LDESClient.createReadStream(url, options));

  const orchestrator = new Orchestrator([connector], state, streams);

  await orchestrator.provision();
  await orchestrator.run();
}

run().catch(error => console.error(error));
