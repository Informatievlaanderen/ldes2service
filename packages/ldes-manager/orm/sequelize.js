"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = void 0;
require('dotenv').config();
const sequelize_typescript_1 = require("sequelize-typescript");
const connectionString = process.env.DATABASE_URL;
console.debug('Connection string', connectionString);
exports.sequelize = new sequelize_typescript_1.Sequelize(connectionString);
