import { FastifyInstance, FastifyPluginOptions, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { Connector } from '../../lib/models/Connector.model';
import { Orchestrator } from '../../lib/models/Orchestrator.model';
import sequelize from '../../orm/sequelize';

interface orchestratorParams {
  id: number;
}

const orchestratorRepository = sequelize.getRepository(Orchestrator);

const OrchestratorRoute: FastifyPluginAsync = async (
  server: FastifyInstance,
  options: FastifyPluginOptions
) => {
  server.get('/orchestrator', {}, async (request, reply) => {
    try {
      const orchestrators = await orchestratorRepository.findAll();
      return reply.code(200).send(orchestrators);
    } catch (error) {
      request.log.error(error);
      console.error(error);
      return reply.code(500).send({ message: 'Server error' });
    }
  });

  server.get<{ Params: orchestratorParams }>('/orchestrator/:id', {}, async (request, reply) => {
    try {
      const id = request.params.id;
      const orchestrator = await orchestratorRepository.findOne({
        where: { id: id },
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
};

export default fp(OrchestratorRoute);
