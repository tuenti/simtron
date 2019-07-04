"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

const createGetAllSimsResolver = store => () => store.sim.getAllSimsInUse(false).map(sim => ({
  msisdn: sim.msisdn,
  brand: sim.brand,
  country: sim.country,
  environments: ['prod'],
  status: {
    id: sim.networkStatus.id.toString(),
    name: sim.networkStatus.name
  },
  isOnline: sim.networkStatus.isWorking
}));

var _default = createGetAllSimsResolver;
exports.default = _default;