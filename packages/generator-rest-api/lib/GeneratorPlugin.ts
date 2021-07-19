import type { FastifyInstance, FastifyPluginOptions, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { DockerComposeGenerator } from '../../docker-compose-generator';
import { HelmFileGenerator } from '../../helm-file-generator';

const dockerComposeGenerator = new DockerComposeGenerator();
const helmFileGenerator = new HelmFileGenerator();

const GeneratorRoute: FastifyPluginAsync = async (server: FastifyInstance, options: FastifyPluginOptions) => {
  server.post(
    '/setup',
    {
      schema: {
        body: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              helmTemplate: { type: 'string' },
              composeTemplate: { type: 'string' },
            },
          },
        },
      },
    },
    async (_request: any, _reply: any) => {
      dockerComposeGenerator.setup(_request.body);
      helmFileGenerator.setup(_request.body);
      _reply.send('Generators updated.');
    }
  );

  server.post(
    '/generator',
    {
      schema: {
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
      },
    },
    async (_request: any, _reply: any) => {
      switch (_request.body.type) {
        case 'helm':
          _reply.send(helmFileGenerator.generate(_request.body.services));
          break;
        case 'compose':
          _reply.send(dockerComposeGenerator.generate(_request.body.services, _request.body.replicator));
          break;
        default:
          _reply.send('No file type was selected!');
      }
    }
  );
};

export const router = fp(GeneratorRoute);
