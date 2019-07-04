"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _handler = _interopRequireWildcard(require("./handler"));

var _command = require("../device-port/model/command");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

const SIM_OPERATOR_DATA_KEY = 'operator';
const ICC_DATA_KEY = 'icc';

const getOperatorStatusText = operatorStatus => {
  switch (operatorStatus) {
    case _command.OperatorStatus.Current:
      return 'Currently selected';

    case _command.OperatorStatus.Available:
      return 'Available';

    case _command.OperatorStatus.Forbidden:
      return 'Forbidden';

    default:
      return 'Unknown status';
  }
};

const createSelectOperatorQuestionOptions = operators => operators.map(operator => ({
  text: operator.longName ? `${operator.longName} (${getOperatorStatusText(operator.status)})` : `${operator.shortName} (${getOperatorStatusText(operator.status)})`,
  value: operator
}));

const getAvailableOperators = (portId, sendCommand) => () => {
  return new Promise(resolve => {
    sendCommand((0, _command.createSearchOperatorsCommand)(), portId).then(({
      operators
    }) => resolve(createSelectOperatorQuestionOptions(operators)));
  });
};

const createForceSimOperatorQuestionary = ({
  icc,
  portId
}, sendCommand) => (0, _handler.default)({
  questions: [{
    dataId: SIM_OPERATOR_DATA_KEY,
    type: 'single-selection',
    text: 'Select the operator you want to force the sim to:',
    optionsCreator: getAvailableOperators(portId, sendCommand),
    errorMessages: {
      [_handler.INVALID_INDEX]: ':face_with_rolling_eyes: Select an option please ... type the number of the selected option !'
    }
  }],
  initialData: [{
    dataId: ICC_DATA_KEY,
    value: icc
  }],
  finishCallback: responses => {
    const operator = responses[SIM_OPERATOR_DATA_KEY];
    sendCommand((0, _command.createForceOperatorCommand)(operator), portId);
  },
  finishFeedbackText: 'Connecting to selected operator.'
});

var _default = createForceSimOperatorQuestionary;
exports.default = _default;