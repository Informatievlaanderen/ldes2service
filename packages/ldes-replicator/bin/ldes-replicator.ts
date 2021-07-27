/**
 * CLI interface where manual dependency injection happens
 */

import { RedisState } from '@ldes/ldes-redis-state';
import { newEngine } from '@treecg/actor-init-ldes-client';
import { DataFactory } from 'n3';
import fetch from 'node-fetch';
import rdfDereferencer from 'rdf-dereference';
import { storeStream } from 'rdf-store-stream';
import slugify from 'slugify';

const { namedNode } = DataFactory;

import { Orchestrator } from '../lib/Orchestrator';
import type { LdesObjects, LdesShape } from '@ldes/types';

// TODO: Parse and use CLI parameters

const URLS = process.env.URLS;
const STATE_CONFIG = JSON.parse(process.env.STATE_CONFIG || '{"id":"replicator"}');
const CONNECTORS = JSON.parse(process.env.CONNECTORS || '[]');
const POLL_INTERVAL = Number.parseInt(process.env.pollingInterval ?? '5000', 10);

/**
 * This code fetches the shape by dereferencing the LDES URI, and then always derefencing the shape again
 * TODO We might want to catch the fact that possibly the shape is already contained in the received quads.
 */
async function fetchShape(ldesURI: string): Promise<LdesShape> {
  const {LDESquads} = await rdfDereferencer.dereference(ldesURI);
  let shapeURL = "";
  for (let quad of LDESquads) {
    if (quad.subject.value === ldesURI && quad.predicate.value === 'https://w3id.org/tree#shape') {
      //TODO: detect if this is a blank node. If it is, we’ll need to extract the shape from the current page instead!
      if (quad.object.termType === 'BlankNode') {
        //FAIL the code: not yet supported -- will implement later
        throw new Exception("Blank node shapes not supported yet");
      }
      shapeURL = quad.object.value;
      
    }
  }
  if (shapeURL === "") {
      throw new Exception("No shape URL found when derefencing the LDES URI");
  }
  
  const { quads } = await rdfDereferencer.dereference(shapeURL);

  const store = await storeStream(quads);

  const paths = Object.fromEntries(
    store
      // @ts-expect-error
      .getQuads(undefined, namedNode('https://www.w3.org/ns/shacl#path'))
      .map((quad: any) => [quad.subject.value, quad])
  );
  const datatypes = Object.fromEntries(
    store
      // @ts-expect-error
      .getQuads(undefined, namedNode('https://www.w3.org/ns/shacl#datatype'))
      .map((quad: any) => [quad.subject.value, quad])
  );
  const nodeKinds = Object.fromEntries(
    store
      // @ts-expect-error
      .getQuads(undefined, namedNode('https://www.w3.org/ns/shacl#nodeKind'))
      .map((quad: any) => [quad.subject.value, quad])
  );
  const classes = Object.fromEntries(
    store
      // @ts-expect-error
      .getQuads(undefined, namedNode('https://www.w3.org/ns/shacl#class'))
      .map((quad: any) => [quad.subject.value, quad])
  );

  return Object.entries(paths).map(([id, quad]) => ({
    path: quad.object.value,
    datatype: datatypes[id]?.object.value ?? nodeKinds[id]?.object.value ?? classes[id]?.object.value,
  }));
}

async function run(): Promise<void> {
  const state = new RedisState(STATE_CONFIG);

  const options = {
    pollingInterval: POLL_INTERVAL,
  };

  if (!URLS) {
    throw new Error('No LDES URLs specified. Have you added the URL environment variable?');
  }

  const streams: LdesObjects = Object.fromEntries(
    await Promise.all(
      URLS.split(',').map(async (url: string) => [
        url,
        {
          stream: newEngine().createReadStream(url, options),
          url,
          name: slugify(url, { remove: /[!"'()*+./:@~]/g }),
          shape: await fetchShape(url),
        },
      ])
    )
  );

  const orchestrator = new Orchestrator(state, streams);

  await orchestrator.provision();
  await orchestrator.run();
}

run().catch(error => console.error(error));
