"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.createSchema = void 0;

var _graphql = _interopRequireDefault(require("./model/graphql"));

var _resolvers = _interopRequireDefault(require("./resolvers"));

var _graphqlTools = require("graphql-tools");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const createSchema = store => {
  return (0, _graphqlTools.makeExecutableSchema)({
    typeDefs: _graphql.default,
    resolvers: (0, _resolvers.default)(store)
  });
};

exports.createSchema = createSchema;

var _default = (0, _graphqlTools.makeExecutableSchema)({
  typeDefs: _graphql.default
});

exports.default = _default;