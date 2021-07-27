import type { FastifyInstance, FastifyPluginOptions, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import sequelize from '../../bin/orm/sequelize';
import { Connector } from '../models/Connector.model';
import { Orchestrator } from '../models/Orchestrator.model';

interface connectorParams {
  id: number;
}

interface connectorAttrs {
  name: string;
  type: string;
  image: string;
  port: number;
  config: JSON;
}

const connectorBodyJsonSchema = {
  type: 'object',
  required: ['name', 'type', 'image', 'port', 'config'],
  properties: {
    name: { type: 'string' },
    type: {
      type: 'string',
      enum: ['@ldes/ldes-postgres-connector', '@ldes/ldes-mongodb-connector'],
    },
    image: { type: 'string' },
    port: { type: 'number' },
    config: { type: 'object' },
  },
};

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
        where: { id },
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

  server.post<{ Body: connectorAttrs }>(
    '/connectors',
    //{ schema: { body: connectorBodyJsonSchema } },
    async (request, reply) => {
      console.log(request.body);

      try {
        const { name, type, image, port, config } = request.body;
        await connectorRepository.create({
          name,
          type,
          image,
          port,
          config,
        });

        reply.code(201).send({ message: 'Created' });
      } catch (error) {
        request.log.error(error);
        console.error(error);
        return reply.code(500).send({ message: 'Server error' });
      }
    }
  );

  server.delete<{ Params: connectorParams }>('/connectors/:id', {}, async (request, reply) => {
    try {
      const id = request.params.id;
      await connectorRepository.destroy({
        where: { id },
      });

      return reply.code(200).send({ message: 'Deleted' });
    } catch (error) {
      request.log.error(error);
      console.error(error);
      return reply.code(500).send({ message: 'Server error' });
    }
  });

  server.put<{ Body: connectorAttrs; Params: connectorParams }>(
    '/connectors/:id',
    { schema: { body: connectorBodyJsonSchema } },
    async (request, reply) => {
      try {
        const { name, type, image, port, config } = request.body;
        const id = request.params.id;

        const connector = await connectorRepository.findOne({
          where: { id },
        });

        if (connector) {
          await connector.update({
            name,
            type,
            image,
            port,
            config,
          });
        } else {
          return reply.code(400).send({ message: 'Connector not found' });
        }

        return reply.code(200).send({ message: 'Updated' });
      } catch (error) {
        request.log.error(error);
        console.error(error);
        return reply.code(500).send({ message: 'Server error' });
      }
    }
  );
};

export default fp(ConnectorRoute);
