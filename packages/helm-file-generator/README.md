# `@ldes/helm-file-generator`

> Generates a helmfile to run an LDES replicator and its connected backends with user provided settings.

## Usage

```js
const { HelmFileGenerator } = require('helm-file-generator');

const generator = new HelmFileGenerator();

// Those are also defined in the LDES connectors
const templates = [
  {
    name: 'templateName',
    //A helmfile release, parameter placeholders can be added with {parameter}
    helmTemplate: `
name: myService
chart: {chart}
    `
  }
]

generator.setup(templates);

const services = {
  //The key represents the template to use
  templateName: {
    //The NPM module to use
    type: "@ldes/ldes-connector",
    //The parameters to give to the replicator, also the parameters added to the template
    settings: {...}
  }
}

// The replicator settings
const replicator = {
  "polling_interval": 5000,
  "urls": "LDES.example",
  // True if a redis service should be generated, will override "state"
  "redis": true,
  "state": {
    "id": "replicator",
    "host": "10.0.0.10"
  }
}

generator.generate(services, replicator);
```
