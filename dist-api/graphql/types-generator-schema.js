"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _graphql = _interopRequireDefault(require("./model/graphql"));

var _graphqlTools = require("graphql-tools");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = (0, _graphqlTools.makeExecutableSchema)({
  typeDefs: _graphql.default
});

exports.default = _default;