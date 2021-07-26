/**
 * CLI interface where manual dependency injection happens
 */

import { RedisState } from '@ldes/ldes-redis-state';
import { newEngine } from '@treecg/actor-init-ldes-client';
import fetch from 'node-fetch';
import slugify from 'slugify';
import { storeStream } from 'rdf-store-stream';
import rdfDereferencer from 'rdf-dereference';

import { DataFactory } from 'n3';
const { namedNode } = DataFactory;

import { Orchestrator } from '../lib/Orchestrator';
import { LdesObjects, LdesShape } from '@ldes/types';

// TODO: Parse and use CLI parameters

const URLS = process.env.URLS;
const STATE_CONFIG = JSON.parse(process.env.STATE_CONFIG || '{"id":"replicator"}');
const CONNECTORS = JSON.parse(process.env.CONNECTORS || '[]');
const POLL_INTERVAL = Number.parseInt(process.env.pollingInterval ?? '5000', 10);

async function fetchShape(ldesURI: string): Promise<LdesShape> {
  const json = await fetch(ldesURI).then(res => res.json());

  const { quads } = await rdfDereferencer.dereference(json['shacl']['shape']);

  const store = await storeStream(quads);

  const paths = Object.fromEntries(
    store
      // @ts-ignore
      .getQuads(undefined, namedNode('https://www.w3.org/ns/shacl#path'), undefined)
      .map((quad: any) => [quad.subject.value, quad])
  );
  const datatypes = Object.fromEntries(
    store
      // @ts-ignore
      .getQuads(undefined, namedNode('https://www.w3.org/ns/shacl#datatype'), undefined)
      .map((quad: any) => [quad.subject.value, quad])
  );
  const nodeKinds = Object.fromEntries(
    store
      // @ts-ignore
      .getQuads(undefined, namedNode('https://www.w3.org/ns/shacl#nodeKind'), undefined)
      .map((quad: any) => [quad.subject.value, quad])
  );
  const classes = Object.fromEntries(
    store
      // @ts-ignore
      .getQuads(undefined, namedNode('https://www.w3.org/ns/shacl#class'), undefined)
      .map((quad: any) => [quad.subject.value, quad])
  );

  return Object.entries(paths).map(([id, quad]) => {
    return {
      path: quad.object.value,
      datatype: datatypes[id]?.object.value ?? nodeKinds[id]?.object.value ?? classes[id]?.object.value,
    };
  });
}

async function run(): Promise<void> {
  const state = new RedisState(STATE_CONFIG);

  const options = {
    pollingInterval: POLL_INTERVAL,
  };

  if (!URLS) {
    throw new Error('No LDES URLs specified. Have you added the URL environment variable?');
  }

  const LDESClient = newEngine();

  const streams: LdesObjects = Object.fromEntries(
    await Promise.all(
      URLS.split(',').map(async (url: string) => [
        url,
        {
          stream: LDESClient.createReadStream(url, options),
          url: url,
          name: slugify(url, { remove: /[*+~.()'"!:@/]/g }),
          shape: await fetchShape(url),
        },
      ])
    )
  );

  // console.debug("Streams", streams);

  const orchestrator = new Orchestrator(state, streams);

  await orchestrator.provision();
  await orchestrator.run();
}

run().catch(error => console.error(error));
