export const template = {
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
