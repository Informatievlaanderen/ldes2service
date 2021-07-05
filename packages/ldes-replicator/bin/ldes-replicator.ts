/**
 * CLI interface where manual dependency injection happens
 */

import { DummyConnector } from '@ldes/ldes-dummy-connector';
import { DummyState } from '@ldes/ldes-dummy-state';

import { newEngine } from '@treecg/actor-init-ldes-client';
import { Orchestrator } from '../lib/Orchestrator';

// TODO: Parse and use CLI parameters

async function run(): Promise<void> {
  const connector = new DummyConnector();
  const state = new DummyState();

  const url = 'https://apidg.gent.be/opendata/adlib2eventstream/v1/dmg/objecten';
  const options = {
    pollingInterval: 5_000,
  };
  const LDESClient = newEngine();
  const eventstreamSync = LDESClient.createReadStream(url, options);

  const orchestrator = new Orchestrator([ connector ], state, eventstreamSync);

  await orchestrator.provision();
  await orchestrator.run();
}

run().catch(error => console.error(error));
