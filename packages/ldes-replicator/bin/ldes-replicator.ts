/**
 * CLI interface where manual dependency injection happens
 */

import { RedisState } from '@ldes/ldes-redis-state';

import { newEngine } from '@treecg/actor-init-ldes-client';
import { Orchestrator } from '../lib/Orchestrator';

// TODO: Parse and use CLI parameters

const URLS = process.env.URLS;
const STATE_CONFIG = JSON.parse(process.env.STATE_CONFIG || '{"id":"replicator"}');
const CONNECTORS = JSON.parse(process.env.CONNECTORS || '[]');
const POLL_INTERVAL = Number.parseInt(process.env.pollingInterval ?? '5000', 10);

async function run(): Promise<void> {
  const state = new RedisState(STATE_CONFIG);

  const options = {
    pollingInterval: POLL_INTERVAL,
  };

  if (!URLS) {
    throw new Error('No LDES URLs specified. Have you added the URL environment variable?');
  }

  const connectors = CONNECTORS.map((con: string) => {
    const config = JSON.parse(process.env[`CONNECTOR_${con}_CONFIG`] || '{}');

    const Connector = require(process.env[`CONNECTOR_${con}_TYPE`] || '@ldes/ldes-dummy-connector');
    const connectorName = Object.keys(Connector).find(key => key.endsWith('Connector'));

    if (!connectorName) {
      throw new Error(`The connector ${con} couldn't be loaded correctly!`);
    }

    return new Connector[connectorName](config);
  });

  const LDESClient = newEngine();

  const streams = URLS.split(',').map(url => LDESClient.createReadStream(url, options));

  const orchestrator = new Orchestrator(connectors, state, streams);

  await orchestrator.provision();
  await orchestrator.run();
}

run().catch(error => console.error(error));
