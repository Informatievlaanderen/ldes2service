import type { IConfigTemplate } from '@ldes/types';

export const template: IConfigTemplate = {
  name: 'mongo-db-connector',
  fields: [
    {
      name: 'connectionString',
      validation: ['required', 'string'],
      value: 'default value',
    },
    {
      name: 'polling_interval',
      validation: ['required', 'number'],
    },
  ],
};
