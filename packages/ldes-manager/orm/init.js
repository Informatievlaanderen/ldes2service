"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("./sequelize");
sequelize_1.default.sync({ force: true });
