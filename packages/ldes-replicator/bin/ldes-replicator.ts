/**
 * CLI interface where manual dependency injection happens
 */

import { DummyConnector } from '@ldes/ldes-dummy-connector';
import { RedisState } from '@ldes/ldes-redis-state';

import { newEngine } from '@treecg/actor-init-ldes-client';
import { Orchestrator } from '../lib/Orchestrator';

// TODO: Parse and use CLI parameters

const URLS = process.env.URLS;
const POLL_INTERVAL = Number.parseInt(process.env.pollingInterval ?? '5000', 10);

async function run(): Promise<void> {
  const connector = new DummyConnector();
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
