"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _apolloServerExpress = require("apollo-server-express");

var _default = [_apolloServerExpress.gql`
        type SimStatus {
            id: String
            name: String
        }

        type Sim {
            msisdn: String
            environments: [String]
            brand: String
            country: String
            status: SimStatus
            isOnline: Boolean
        }

        type Query {
            getSims: [Sim]
        }
    `];
exports.default = _default;