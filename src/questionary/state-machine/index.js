import {FREE_TEXT_QUESTION, SINGLE_SELECTION_QUESTION} from '../question-type';
import {QUESTION_OPTION_VALUE} from '../question-field';

const createInitialAnswers = initialData =>
    initialData.reduce((answers, {dataId, value}) => ({...answers, [dataId]: value}), {});

const createQuestion = (questionData, previousAnswers) => {
    switch (questionData.type) {
        case FREE_TEXT_QUESTION:
            return questionData;
        case SINGLE_SELECTION_QUESTION:
            return {
                ...questionData,
                options: questionData.options(previousAnswers),
            };
    }
};

export const NO_ERROR = '';
export const INVALID_INDEX = 'invalid-index';

const getDefaultValidatorForQuestion = currentQuestion => {
    switch (currentQuestion.type) {
        case FREE_TEXT_QUESTION:
            return () => NO_ERROR;
        case SINGLE_SELECTION_QUESTION:
            return answer => {
                const selectedIndex = parseInt(answer);
                return selectedIndex !== NaN &&
                    selectedIndex > 0 &&
                    selectedIndex <= currentQuestion.options.length
                    ? NO_ERROR
                    : INVALID_INDEX;
            };
    }
};

const getDefaultFormatterForQuestion = currentQuestion => {
    switch (currentQuestion.type) {
        case FREE_TEXT_QUESTION:
            return answer => answer;
        case SINGLE_SELECTION_QUESTION:
            return answer => currentQuestion.options[parseInt(answer) - 1][QUESTION_OPTION_VALUE];
    }
};

const createQuestionaryStateMachine = (questions, initialData, finishFeedbackText) => {
    const stateMachine = {
        currentQuestionIndex: 0,
        answers: createInitialAnswers(initialData),
        errorMessage: undefined,

        getFinishFeedbackText() {
            return finishFeedbackText;
        },

        getCurrentQuestion() {
            return createQuestion(questions[this.currentQuestionIndex], this.answers);
        },

        answerCurrentQuestion(answer) {
            const currentQuestion = this.getCurrentQuestion();
            const validator = currentQuestion.validator
                ? currentQuestion.validator
                : getDefaultValidatorForQuestion(currentQuestion);
            const errorCode = validator(answer, this.answers);
            if (errorCode) {
                this.errorMessage = currentQuestion.errorMessages[errorCode]
                    ? currentQuestion.errorMessages[errorCode]
                    : ':robot_face: No compute.';
                return false;
            } else {
                const answerFormatter = currentQuestion.answerFormatter
                    ? currentQuestion.answerFormatter
                    : getDefaultFormatterForQuestion(currentQuestion);
                this.answers[currentQuestion.dataId] = answerFormatter(answer, this.answers);
                this.currentQuestionIndex++;
                return true;
            }
        },

        isFullfilled() {
            return !questions.find(({dataId}) => this.answers[dataId] === undefined);
        },

        getValidationErrorText() {
            return this.errorMessage;
        },

        getAnswers() {
            return this.answers;
        },
    };

    return stateMachine;
};

export default createQuestionaryStateMachine;
