import { router, generatorSetup } from '@ldes/generator-rest-api';
import { template as mongoTemplate } from '@ldes/ldes-mongodb-connector';
import { template as postgresTemplate } from '@ldes/ldes-postgres-connector';

generatorSetup([
  {
    id: postgresTemplate.name,
    helmTemplate: postgresTemplate.helmTemplate,
    composeTemplate: postgresTemplate.composeTemplate,
  },
  {
    id: mongoTemplate.name,
    helmTemplate: mongoTemplate.helmTemplate,
    composeTemplate: mongoTemplate.composeTemplate,
  },
]);

export default router;
