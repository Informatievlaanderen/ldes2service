import type { FastifyInstance } from 'fastify';
import Fastify from 'fastify';
import AvailableConnectorsRoute from '../lib/routes/AvailableConnectors.route';
import ConnectorRoute from '../lib/routes/Connector.route';
import { router as GeneratorRoute, generatorSetup } from '../lib/routes/Generator.route';
import OrchestratorRoute from '../lib/routes/Orchestrator.route';

const port = process.env.PORT || 7_000;
const server: FastifyInstance = Fastify({});

const start = async (): Promise<void> => {
  try {
    await Promise.all([
      server.register(ConnectorRoute),
      server.register(OrchestratorRoute),
      server.register(AvailableConnectorsRoute),
      server.register(GeneratorRoute),
    ]);
    await server.listen(port);
    await generatorSetup();
    console.log('Server started successfully');
  } catch (error: unknown) {
    console.error(error);
    server.log.error(error);
    process.exit(1);
  }
};

start();
