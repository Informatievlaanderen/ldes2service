# `ldes-replicator`

> Allows you to replicate any amount of LDES into different backends via connectors.

## Usage

```js
const { Orchestrator } = require('ldes-replicator');

const { DummyState } = require('@ldes/ldes-dummy-state');
const { DummyConnector } = require('@ldes/ldes-dummy-connector');
const { newEngine } = require('@treecg/actor-init-ldes-client');

async function run(): Promise<void> {
  const state = new DummyState({});

  //Multiple connectors can be used
  const connectors = [new DummyConnector({})];

  const LDESClient = newEngine();

  const streamOptions = {
    pollingInterval: 5_000,
  };

  const streams = [LDESClient.createReadStream('LDES.example', streamOptions)];

  const orchestrator = new Orchestrator(state, connectors, streams);

  await orchestrator.provision();
  await orchestrator.run();
}

run().catch(error => console.error(error));
```
