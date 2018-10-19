const createInitialAnswers = initialData =>
    initialData.reduce((answers, {dataId, value}) => ({...answers, [dataId]: value}), {});

const createQuestionaryStateMachine = (questions, initialData, finishFeedbackText) => {
    const stateMachine = {
        currentQuestionIndex: 0,
        answers: createInitialAnswers(initialData),

        getFinishFeedbackText() {
            return finishFeedbackText;
        },

        getCurrentQuestion() {
            return questions[this.currentQuestionIndex];
        },

        answerCurrentQuestion(answer) {
            const currentQuestion = questions[this.currentQuestionIndex];
            this.answers[currentQuestion.dataId] = answer;
            this.currentQuestionIndex++;
            return true;
        },

        isFullfilled() {
            return !questions.find(({dataId}) => this.answers[dataId] === undefined);
        },

        getValidationErrorText() {},

        getAnswers() {
            return this.answers;
        },
    };

    return stateMachine;
};

export default createQuestionaryStateMachine;
