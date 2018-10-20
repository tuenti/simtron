const createInitialAnswers = initialData =>
    initialData.reduce((answers, {dataId, value}) => ({...answers, [dataId]: value}), {});

export const NO_ERROR = '';

const createQuestionaryStateMachine = (questions, initialData, finishFeedbackText) => {
    const stateMachine = {
        currentQuestionIndex: 0,
        answers: createInitialAnswers(initialData),
        errorMessage: undefined,

        getFinishFeedbackText() {
            return finishFeedbackText;
        },

        getCurrentQuestion() {
            return questions[this.currentQuestionIndex];
        },

        answerCurrentQuestion(answer) {
            const currentQuestion = questions[this.currentQuestionIndex];
            const validator = currentQuestion.validator ? currentQuestion.validator : () => NO_ERROR;
            const errorCode = validator(answer, this.answers);
            if (errorCode) {
                this.errorMessage = currentQuestion.errorMessages[errorCode]
                    ? currentQuestion.errorMessages[errorCode]
                    : ':robot_face: No compute.';
                return false;
            } else {
                const answerFormatter = currentQuestion.answerFormatter
                    ? currentQuestion.answerFormatter
                    : () => answer;
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
