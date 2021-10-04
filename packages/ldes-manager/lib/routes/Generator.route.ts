import { router, generatorSetup } from '@treecg/ldes-generator-rest-api';
import { template as mongoTemplate } from '@treecg/ldes-mongodb-connector';
import { template as postgresTemplate } from '@treecg/ldes-postgres-connector';

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
