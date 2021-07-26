import { IConnectorService } from '@ldes/types';
import { template as postgresConnectorTemplate } from '@ldes/ldes-postgres-connector/template';
import { template as mongodbConnectorTemplate } from '@ldes/ldes-mongodb-connector/template';

export const availableConnectors = {
  [postgresConnectorTemplate.name]: postgresConnectorTemplate,
  [mongodbConnectorTemplate.name]: mongodbConnectorTemplate,
};

export const ldesUris = [
  'https://smartdata.dev-vlaanderen.be/base/straatnaam',
  'https://apidg.gent.be/opendata/adlib2eventstream/v1/dmg/objecten',
];

export const connectors: IConnectorService[] = [
  {
    id: '1',
    name: 'MongoDB Connector',
    image: 'mongodb:latest',
    type: '@ldes/ldes-mongodb-connector',
    port: 2017,
    config: {},
    createdAt: '2021-07-20T11:30:00.000Z',
    updatedAt: '2021-07-20T11:30:00.000Z',
    orchestrators: [
      {
        id: '1',
        ldes_uri: 'https://smartdata.dev-vlaanderen.be/base/straatnaam',
        name: 'Streetnames',
        slug: 'streetnames',
        polling_interval: 5000,
      },
      {
        id: '2',
        ldes_uri: 'https://apidg.gent.be/opendata/adlib2eventstream/v1/dmg/objecten',
        name: 'Objects',
        slug: 'objects',
        polling_interval: 5000,
      },
    ],
  },
  {
    id: '2',
    name: 'PostgreSQL Connector',
    image: 'postgres:latest',
    type: '@ldes/ldes-postgres-connector',
    port: 2018,
    config: {},
    createdAt: '2021-07-20T12:30:00.000Z',
    updatedAt: '2021-07-20T12:30:00.000Z',
  },
  {
    id: '3',
    name: 'PostgreSQL Connector',
    image: 'postgres:latest',
    type: '@ldes/ldes-postgres-connector',
    port: 2019,
    config: {},
    createdAt: '2021-07-20T12:30:00.000Z',
    updatedAt: '2021-07-20T12:30:00.000Z',
  },
];
