import Fastify, { FastifyInstance } from 'fastify';
import ConnectorRoute from './routes/Connector.route';

const port = process.env.PORT || 7000;
const server: FastifyInstance = Fastify({});

server.register(ConnectorRoute);

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
