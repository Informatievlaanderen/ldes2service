# LDES2Service

LDES2Service is a set of NPM packages you can use to replicate an LDES in a back-end system of choice.

A Linked Data Event Stream (LDES) is a collection of immutable objects. The HTTP interface adheres to the [LDES specification](https://w3id.org/ldes/specification) by SEMIC. An LDES can be fragmented in different ways using the [TREE specification](https://w3id.org/tree/specification). Check the [TREE Linked Data Fragments website](https://tree.linkeddatafragments.org) for more background and implementations.

## Installation

```
npm install
npm run build
node packages/ldes-replicator/bin/ldes-replicator.js
```

## Writing your own connector

See the example in https://github.com/Informatievlaanderen/ldes2service/tree/main/packages/ldes-dummy-connector

## Running it with Docker

_Coming soon_
