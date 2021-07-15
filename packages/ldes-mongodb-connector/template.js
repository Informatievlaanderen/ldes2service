"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.template = void 0;
exports.template = {
    "name": "mongo-db-connector",
    "fields": [
        {
            "name": "connectionString",
            "validation": ['required', 'string'],
            "value": "default value"
        },
        {
            "name": "polling_interval",
            "validation": ['required', 'number']
        }
    ]
};
