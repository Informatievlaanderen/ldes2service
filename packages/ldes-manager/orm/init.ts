import { Connector } from '../lib/models/Connector.model';
import { Orchestrator } from '../lib/models/Orchestrator.model';
import sequelize from './sequelize';

sequelize.sync({ force: true });
