import Fastify, { FastifyInstance } from 'fastify';
import ConnectorRoute from '../lib/routes/Connector.route';
import OrchestratorRoute from '../lib/routes/Orchestrator.route';

const port = process.env.PORT || 7000;
const server: FastifyInstance = Fastify({});

server.register(ConnectorRoute);
server.register(OrchestratorRoute);

const start = async () => {
  try {
    await server.listen(port);
    console.log('Server started successfully');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};
start();
