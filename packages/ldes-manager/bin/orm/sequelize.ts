require('dotenv').config();
import { Sequelize } from 'sequelize-typescript';
import { Connector } from '../../lib/models/Connector.model';
import { ConnectorOrchestrator } from '../../lib/models/ConnectorOrchestrator.model';
import { Orchestrator } from '../../lib/models/Orchestrator.model';

const connectionString = process.env.DATABASE_URL!;
console.debug('Connection string', connectionString);
const sequelize = new Sequelize(connectionString, { repositoryMode: true });
sequelize.addModels([Connector, Orchestrator, ConnectorOrchestrator]);

export default sequelize;
