export const NO_ERROR = '';
export const INVALID_INDEX = 'invalid-index';

type QuestionType = 'free-text' | 'single-selection';

interface QuestionOption {
    value: string;
    text: string;
}

export interface Question {
    dataId: string;
    type: QuestionType;
    text: string;
    errorMessages: Answers;
    validator?: (answer: string, previousAnswers: Answers) => string;
    answerFormatter?: (answer: string, previousAnswers: Answers) => any;
}

export type Answers = {[key: string]: any};

export interface TextQuestion extends Question {}

export interface SelectionQuestion extends Question {
    optionsCreator: (previousAnswers: Answers) => QuestionOption[] | Promise<QuestionOption[]>;
    options?: QuestionOption[];
}
interface Answer {
    dataId: string;
    value: any;
}

type FinishCallback = (answers: Answers) => void;

export interface Questionary {
    currentQuestionIndex: number;
    answers: Answers;
    errorMessage: string;
    getFinishFeedbackText: () => string;
    getCurrentQuestion: () => Promise<Question>;

    answerCurrentQuestion: (answer: string) => Promise<boolean>;

    isFullfilled: () => boolean;

    getValidationErrorText: () => string;

    finish: () => void;

    cancel: () => void;

    isCanceled: () => boolean;
}

export const isSelectionQuestion = (question: Question): question is SelectionQuestion => {
    return question.type === 'single-selection';
};

const createInitialAnswers = (initialData: Answer[]): Answers =>
    initialData.reduce((answers, {dataId, value}) => ({...answers, [dataId]: value}), {});

const getDefaultValidatorForQuestion = (currentQuestion: Question) => {
    if (isSelectionQuestion(currentQuestion)) {
        return (answer: string) => {
            const selectedIndex = parseInt(answer);
            return selectedIndex !== NaN &&
                selectedIndex > 0 &&
                currentQuestion.options &&
                selectedIndex <= currentQuestion.options.length
                ? NO_ERROR
                : INVALID_INDEX;
        };
    } else {
        return (_: string) => NO_ERROR;
    }
};

const getDefaultFormatterForQuestion = (currentQuestion: Question) => {
    if (isSelectionQuestion(currentQuestion)) {
        return (answer: string) =>
            currentQuestion.options ? currentQuestion.options[parseInt(answer) - 1].value : '';
    } else {
        return (answer: string) => answer;
    }
};

const createQuestionaryHandler = ({
    questions,
    initialData,
    finishCallback,
    finishFeedbackText,
}: {
    questions: (TextQuestion | SelectionQuestion)[];
    initialData: Answer[];
    finishCallback: FinishCallback;
    finishFeedbackText: string;
}): Questionary => {
    const stateMachine = {
        questionOptionsCache: <QuestionOption[][]>[],
        canceled: false,
        currentQuestionIndex: 0,
        answers: createInitialAnswers(initialData),
        errorMessage: '',

        getFinishFeedbackText() {
            return finishFeedbackText;
        },

        async getCurrentQuestion() {
            const createQuestion = (
                questionData: Question,
                previousAnswers: Answers
            ): Promise<TextQuestion | SelectionQuestion> => {
                if (isSelectionQuestion(questionData)) {
                    const optionsCreatorResult = this.questionOptionsCache[this.currentQuestionIndex]
                        ? this.questionOptionsCache[this.currentQuestionIndex]
                        : questionData.optionsCreator(previousAnswers);
                    if (optionsCreatorResult instanceof Promise) {
                        return new Promise((resolve, reject) => {
                            optionsCreatorResult
                                .then(options => {
                                    this.questionOptionsCache[this.currentQuestionIndex] = options;
                                    resolve({
                                        ...questionData,
                                        options,
                                    });
                                })
                                .catch(reject);
                        });
                    } else {
                        this.questionOptionsCache[this.currentQuestionIndex] = optionsCreatorResult;
                        return Promise.resolve({
                            ...questionData,
                            options: optionsCreatorResult,
                        });
                    }
                } else {
                    return Promise.resolve(questionData);
                }
            };

            return createQuestion(questions[this.currentQuestionIndex], this.answers);
        },

        async answerCurrentQuestion(answer: string) {
            const currentQuestion = await this.getCurrentQuestion();
            const validator = currentQuestion.validator
                ? currentQuestion.validator
                : getDefaultValidatorForQuestion(currentQuestion);
            const errorCode = validator(answer, this.answers);
            if (errorCode) {
                const typedErrorMessage = currentQuestion.errorMessages[errorCode];
                this.errorMessage = typedErrorMessage ? typedErrorMessage : ':robot_face: No compute.';
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

        finish() {
            finishCallback(this.answers);
        },

        cancel() {
            this.canceled = true;
        },

        isCanceled() {
            return this.canceled;
        },
    };

    return stateMachine;
};

export default createQuestionaryHandler;
