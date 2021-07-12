import { sequelize } from './sequelize';

sequelize.sync({ force: true });
