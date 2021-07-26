# `generator-rest-api`

> Exposes the helm/compose file generators as a Fastify plugin.

## Usage

```js
const { router: generatorRestApi } = require('generator-rest-api');
const fastify = require('fastify')({ logger: true });

async function start() {
  // The plugin accepts two options: "setup" enables the setup route and prefix adds a prefix to all the routes
  await fastify.register(generatorRestApi, { setup: false, prefix: '/generator' });
  await fastify.listen(3_000);
}

start()
  .then(() => console.log('Listening!'))
  .catch(error => console.error(error));
```

## Schemas

```js
ServiceTemplate:
{
  "name": string,
  "helmTemplate": string,
  "composeTemplate": string
}

ServiceConfig:
{
  "type": string,
  //The parameters to give to the replicator, also the parameters added to the template
  "settings": {...}
}

ReplicatorConfig:
{
  "polling_interval": number,
  "urls": string,
  // True if a redis service should be generated, will override "state"
  "redis": boolean,
  "state"?: {
    "id": string,
    "host"?: string,
    "port"?: string,
    "password"?: string
  }
}

GeneratorRequest:
{
  "services": Record<templateName, ServiceConfig>,
  "type": 'helm' | 'compose',
  "replicator": ReplicatorConfig
}
```

## API

|     Route      |                        Description                         |       Input       |      Output       |
| :------------: | :--------------------------------------------------------: | :---------------: | :---------------: |
| /setup `POST`  |       Sets up the templates the generators will use        | ServiceTemplate[] |  200 Status Code  |
| /create `POST` | Generates a helm/compose file with the provided parameters | GeneratorRequest  | Helm/compose file |
