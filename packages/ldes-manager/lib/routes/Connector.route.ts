import { FastifyInstance, FastifyPluginOptions, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { Connector } from '../models/Connector.model';
import { Orchestrator } from '../models/Orchestrator.model';
import sequelize from '../../bin/orm/sequelize';

interface connectorParams {
  id: number;
}

const connectorRepository = sequelize.getRepository(Connector);
const orchestratorRepository = sequelize.getRepository(Orchestrator);

const ConnectorRoute: FastifyPluginAsync = async (server: FastifyInstance, options: FastifyPluginOptions) => {
  server.get('/connectors', {}, async (request, reply) => {
    try {
      const connectors = await connectorRepository.findAll({ include: [orchestratorRepository] });
      return reply.code(200).send(connectors);
    } catch (error) {
      request.log.error(error);
      console.error(error);
      return reply.code(500).send({ message: 'Server error' });
    }
  });

  server.get<{ Params: connectorParams }>('/connectors/:id', {}, async (request, reply) => {
    try {
      const id = request.params.id;
      const connector = await connectorRepository.findOne({
        where: { id: id },
        include: [orchestratorRepository],
      });
      if (!connector) {
        return reply.code(404).send({ message: 'Connector not found' });
      }
      return reply.code(200).send(connector);
    } catch (error) {
      request.log.error(error);
      console.error(error);
      return reply.code(500).send({ message: 'Server error' });
    }
  });
};

export default fp(ConnectorRoute);
