import { FastifyInstance, FastifyPluginOptions, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { template as mongoTemplate } from '@ldes/ldes-mongodb-connector';
import { template as postgresTemplate } from '@ldes/ldes-postgres-connector';

const AvailableConnectorsRoute: FastifyPluginAsync = async (
  server: FastifyInstance,
  options: FastifyPluginOptions
) => {
  server.get('/available-connectors', {}, async (request, reply) => {
    const connectors = [mongoTemplate, postgresTemplate];
    return reply.code(200).send(connectors);
  });
};

export default fp(AvailableConnectorsRoute);
