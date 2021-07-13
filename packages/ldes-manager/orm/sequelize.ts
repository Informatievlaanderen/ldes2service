require('dotenv').config();
import { Sequelize } from 'sequelize-typescript';

const connectionString = process.env.DATABASE_URL!;
console.debug('Connection string', connectionString);
export const sequelize = new Sequelize(connectionString);
