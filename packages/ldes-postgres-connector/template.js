"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.template = void 0;
exports.template = {
    "name": "postgres-db-connector",
    "fields": [
        {
            "name": "host",
            "validation": ['required', 'string']
        },
        {
            "name": "port",
            "validation": ['required', 'number']
        },
        {
            "name": "username",
            "validation": ['required', 'string']
        },
        {
            "name": "password",
            "validation": ['required', 'string']
        }
    ]
};
