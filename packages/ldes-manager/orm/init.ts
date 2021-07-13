import { Connector } from '../lib/models/Connector.model';
import { Orchestrator } from '../lib/models/Orchestrator.model';
import { sequelize } from './sequelize';

sequelize.addModels([Connector, Orchestrator]);

sequelize.sync({ force: true });
