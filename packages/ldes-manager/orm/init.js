"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Connector_model_1 = require("../lib/models/Connector.model");
const Orchestrator_model_1 = require("../lib/models/Orchestrator.model");
const sequelize_1 = require("./sequelize");
sequelize_1.sequelize.addModels([Connector_model_1.Connector, Orchestrator_model_1.Orchestrator]);
sequelize_1.sequelize.sync({ force: true });
