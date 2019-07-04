"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _apolloServerExpress = require("apollo-server-express");

var _schema = require("./schema");

const createGraphqlServer = store => {
  const schema = (0, _schema.createSchema)(store);
  return new _apolloServerExpress.ApolloServer({
    schema,
    playground: false
  });
};

var _default = createGraphqlServer;
exports.default = _default;