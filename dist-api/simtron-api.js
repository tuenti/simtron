"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _graphql = _interopRequireDefault(require("./graphql"));

var _logger = _interopRequireDefault(require("./util/logger"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const startApi = () => {
  const graphql = (0, _graphql.default)(store);
  const app = (0, _express.default)();
  app.use(_express.default.json());
  app.use(_express.default.urlencoded({
    extended: true
  }));
  graphql.applyMiddleware({
    app,
    path: '/api'
  });
  app.listen({
    port: 4000
  }, () => _logger.default.debug('Server ready at http://localhost:4000/api'));
};

var _default = startApi;
exports.default = _default;