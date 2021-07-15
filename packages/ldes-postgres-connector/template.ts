import type { IConfigTemplate } from '@ldes/types';

export const template: IConfigTemplate = {
  name: 'postgres-db-connector',
  fields: [
    {
      name: 'host',
      validation: ['required', 'string'],
    },
    {
      name: 'port',
      validation: ['required', 'number'],
    },
    {
      name: 'username',
      validation: ['required', 'string'],
    },
    {
      name: 'password',
      validation: ['required', 'string'],
    },
  ],
};
