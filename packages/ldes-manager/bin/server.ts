import FastifyCors from '@fastify/cors';
import type { IGeneratorPluginOptions } from '@treecg/ldes-types';
import type { FastifyInstance } from 'fastify';
import Fastify from 'fastify';
import AvailableConnectorsRoute from '../lib/routes/AvailableConnectors.route';
import ConnectorRoute from '../lib/routes/Connector.route';
import GeneratorRoute from '../lib/routes/Generator.route';
import OrchestratorRoute from '../lib/routes/Orchestrator.route';

const port = process.env.PORT || 7_000;
const server: FastifyInstance = Fastify({});

const start = async (): Promise<void> => {
  try {
    await Promise.all([
      server.register(ConnectorRoute),
      server.register(OrchestratorRoute),
      server.register(AvailableConnectorsRoute),
      server.register(FastifyCors),
      server.register<IGeneratorPluginOptions>(GeneratorRoute, { setup: false, prefix: '/generator' }),
    ]);
    await server.listen(port);
    console.log('Server started successfully');
  } catch (error: unknown) {
    console.error(error);
    server.log.error(error);
    process.exit(1);
  }
};

start().catch(error => console.error(error));
