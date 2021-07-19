import { template as mongoTemplate } from '@ldes/ldes-mongodb-connector';
import { template as postgresTemplate } from '@ldes/ldes-postgres-connector';
import type { FastifyInstance, FastifyPluginOptions, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import got from 'got';

const GENERATOR = process.env.GENERATOR || 'localhost:3000';

interface IGeneratorAttrs {
  name: string;
  type: string;
  image: string;
  port: number;
  config: JSON;
}

const generatorBodyJsonSchema = {
  body: {
    type: 'object',
    required: ['services', 'type'],
    properties: {
      services: {
        type: 'object',
      },
      type: { type: 'string' },
      replicator: {
        type: 'object',
      },
    },
  },
};

const GeneratorRoute: FastifyPluginAsync = async (server: FastifyInstance, options: FastifyPluginOptions) => {
  server.post<{ Body: IGeneratorAttrs }>(
    '/generator',
    { schema: { body: generatorBodyJsonSchema } },
    async (request, reply) => {
      try {
        const result = await got.post(`http://${GENERATOR}/create`, {
          json: request.body,
        });

        await reply.code(200).send({ result: result.body });
      } catch (error: unknown) {
        console.error(error);
        return reply.code(500).send({ detail: 'The generator server is unreachable.' });
      }
    }
  );
};

export const router = fp(GeneratorRoute);

const timer = (ms: number): Promise<null> => new Promise(res => setTimeout(res, ms, null));

export const generatorSetup = async (): Promise<void> => {
  let status = 500;
  while (status !== 200) {
    try {
      const result = await got.post(`http://${GENERATOR}/setup`, {
        json: [
          {
            id: '@ldes/ldes-postgres-connector',
            helmTemplate: postgresTemplate.helmTemplate,
            composeTemplate: postgresTemplate.composeTemplate,
          },
          {
            id: '@ldes/ldes-mongodb-connector',
            helmTemplate: mongoTemplate.helmTemplate,
            composeTemplate: mongoTemplate.composeTemplate,
          },
        ],
      });
      status = result.statusCode;
    } catch {
      console.error('The generator is not available yet.');
      status = 0;
    }
    await timer(2_000);
  }
  console.log('The generator has been set up correctly.');
};
