import type { FastifyInstance, FastifyPluginOptions, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import sequelize from '../../bin/orm/sequelize';
import { Connector } from '../models/Connector.model';
import { ConnectorOrchestrator } from '../models/ConnectorOrchestrator.model';
import { Orchestrator } from '../models/Orchestrator.model';

interface orchestratorParams {
  id: number;
}

interface orchestratorAttrs {
  ldes_uri: string;
  name: string;
  connector_id: number;
  polling_interval: number;
}

interface orchestratorUpdateAttrs {
  ldes_uri: string;
  name: string;
  polling_interval: number;
}

const orchestratorBodyJsonSchema = {
  type: 'object',
  required: ['name', 'ldes_uri', 'connector_id', 'polling_interval'],
  properties: {
    name: { type: 'string' },
    ldes_uri: { type: 'string' },
    connector_id: { type: 'number' },
    polling_interval: { type: 'number' },
  },
};

const orchestratorUpdateBodyJsonSchema = {
  type: 'object',
  required: ['name', 'ldes_uri', 'polling_interval'],
  properties: {
    name: { type: 'string' },
    ldes_uri: { type: 'string' },
    polling_interval: { type: 'number' },
  },
};

const orchestratorRepository = sequelize.getRepository(Orchestrator);
const connectorRepository = sequelize.getRepository(Connector);
const connectorOrchestratorRepository = sequelize.getRepository(ConnectorOrchestrator);

const OrchestratorRoute: FastifyPluginAsync = async (
  server: FastifyInstance,
  options: FastifyPluginOptions
) => {
  server.get('/orchestrators', {}, async (request, reply) => {
    try {
      const orchestrators = await orchestratorRepository.findAll();
      return reply.code(200).send(orchestrators);
    } catch (error) {
      request.log.error(error);
      console.error(error);
      return reply.code(500).send({ message: 'Server error' });
    }
  });

  server.get<{ Params: orchestratorParams }>('/orchestrators/:id', {}, async (request, reply) => {
    try {
      const id = request.params.id;
      const orchestrator = await orchestratorRepository.findOne({
        where: { id },
      });
      if (!orchestrator) {
        return reply.code(404).send({ message: 'Orchestrator not found' });
      }
      return reply.code(200).send(orchestrator);
    } catch (error) {
      request.log.error(error);
      console.error(error);
      return reply.code(500).send({ message: 'Server error' });
    }
  });

  server.post<{ Body: orchestratorAttrs }>(
    '/orchestrators',
    { schema: { body: orchestratorBodyJsonSchema } },
    async (request, reply) => {
      try {
        const { name, ldes_uri, connector_id, polling_interval } = request.body;

        const connector = await connectorRepository.findOne({
          where: { id: connector_id },
        });

        if (connector) {
          const orchestrator = await orchestratorRepository.create({
            name,
            ldes_uri,
            polling_interval,
            slug: name.replace(/\s+/g, '-').toLowerCase(),
          });

          await connectorOrchestratorRepository.create({
            connectorId: connector.id,
            orchestratorId: orchestrator.id,
          });
        } else {
          return reply.code(400).send({ message: 'Connector not found' });
        }

        return reply.code(201).send({ message: 'Created' });
      } catch (error) {
        request.log.error(error);
        console.error(error);
        return reply.code(500).send({ message: 'Server error' });
      }
    }
  );

  server.delete<{ Params: orchestratorParams }>('/orchestrators/:id', {}, async (request, reply) => {
    try {
      const id = request.params.id;
      await orchestratorRepository.destroy({
        where: { id },
      });
      return reply.code(200).send({ message: 'Deleted' });
    } catch (error) {
      request.log.error(error);
      console.error(error);
      return reply.code(500).send({ message: 'Server error' });
    }
  });

  server.put<{ Body: orchestratorUpdateAttrs; Params: orchestratorParams }>(
    '/orchestrators/:id',
    { schema: { body: orchestratorUpdateBodyJsonSchema } },
    async (request, reply) => {
      try {
        const { name, ldes_uri, polling_interval } = request.body;
        const id = request.params.id;

        const orchestrator = await orchestratorRepository.findOne({
          where: { id },
        });

        if (orchestrator) {
          await orchestrator.update({
            name,
            ldes_uri,
            polling_interval,
            slug: name.replace(/\s+/g, '-').toLowerCase(),
          });
        } else {
          return reply.code(400).send({ message: 'Orchestrator not found' });
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

export default fp(OrchestratorRoute);
