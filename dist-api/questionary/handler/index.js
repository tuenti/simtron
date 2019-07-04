"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.isSelectionQuestion = exports.INVALID_INDEX = exports.NO_ERROR = void 0;
const NO_ERROR = '';
exports.NO_ERROR = NO_ERROR;
const INVALID_INDEX = 'invalid-index';
exports.INVALID_INDEX = INVALID_INDEX;

const isSelectionQuestion = question => {
  return question.type === 'single-selection';
};

exports.isSelectionQuestion = isSelectionQuestion;

const createInitialAnswers = initialData => initialData.reduce((answers, {
  dataId,
  value
}) => ({ ...answers,
  [dataId]: value
}), {});

const getDefaultValidatorForQuestion = currentQuestion => {
  if (isSelectionQuestion(currentQuestion)) {
    return answer => {
      const selectedIndex = parseInt(answer);
      return selectedIndex !== NaN && selectedIndex > 0 && currentQuestion.options && selectedIndex <= currentQuestion.options.length ? NO_ERROR : INVALID_INDEX;
    };
  } else {
    return _ => NO_ERROR;
  }
};

const getDefaultFormatterForQuestion = currentQuestion => {
  if (isSelectionQuestion(currentQuestion)) {
    return answer => currentQuestion.options ? currentQuestion.options[parseInt(answer) - 1].value : '';
  } else {
    return answer => answer;
  }
};

const createQuestionaryHandler = ({
  questions,
  initialData,
  finishCallback,
  finishFeedbackText
}) => {
  const stateMachine = {
    questionOptionsCache: [],
    canceled: false,
    currentQuestionIndex: 0,
    answers: createInitialAnswers(initialData),
    errorMessage: '',

    getFinishFeedbackText() {
      return finishFeedbackText;
    },

    async getCurrentQuestion() {
      const createQuestion = (questionData, previousAnswers) => {
        if (isSelectionQuestion(questionData)) {
          const optionsCreatorResult = this.questionOptionsCache[this.currentQuestionIndex] ? this.questionOptionsCache[this.currentQuestionIndex] : questionData.optionsCreator(previousAnswers);

          if (optionsCreatorResult instanceof Promise) {
            return new Promise((resolve, reject) => {
              optionsCreatorResult.then(options => {
                this.questionOptionsCache[this.currentQuestionIndex] = options;
                resolve({ ...questionData,
                  options
                });
              }).catch(reject);
            });
          } else {
            this.questionOptionsCache[this.currentQuestionIndex] = optionsCreatorResult;
            return Promise.resolve({ ...questionData,
              options: optionsCreatorResult
            });
          }
        } else {
          return Promise.resolve(questionData);
        }
      };

      return createQuestion(questions[this.currentQuestionIndex], this.answers);
    },

    async answerCurrentQuestion(answer) {
      const currentQuestion = await this.getCurrentQuestion();
      const validator = currentQuestion.validator ? currentQuestion.validator : getDefaultValidatorForQuestion(currentQuestion);
      const errorCode = validator(answer, this.answers);

      if (errorCode) {
        const typedErrorMessage = currentQuestion.errorMessages[errorCode];
        this.errorMessage = typedErrorMessage ? typedErrorMessage : ':robot_face: No compute.';
        return false;
      } else {
        const answerFormatter = currentQuestion.answerFormatter ? currentQuestion.answerFormatter : getDefaultFormatterForQuestion(currentQuestion);
        this.answers[currentQuestion.dataId] = answerFormatter(answer, this.answers);
        this.currentQuestionIndex++;
        return true;
      }
    },

    isFullfilled() {
      return !questions.find(({
        dataId
      }) => this.answers[dataId] === undefined);
    },

    getValidationErrorText() {
      return this.errorMessage;
    },

    finish() {
      finishCallback(this.answers);
    },

    cancel() {
      this.canceled = true;
    },

    isCanceled() {
      return this.canceled;
    }

  };
  return stateMachine;
};

var _default = createQuestionaryHandler;
exports.default = _default;