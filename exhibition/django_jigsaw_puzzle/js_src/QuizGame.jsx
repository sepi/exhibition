import React from 'react';
import { useState, useEffect } from 'react';

import QuizButton from './QuizButton.jsx';

import { Button, Box, CircularProgress, Container, Grid,
	 Stack, FormControl, FormControlLabel, RadioGroup } from '@mui/material';

import { fetchGameData, sendQuestionAnswer } from './api.js';

const navigationTimeout = 3000;

export
function QuizGame({gameUrl, onComplete}) {
    const [game, setGame] = useState();

    // Load game detail from API when game selected
    useEffect(() => {
	const get = async (gameUrl) => {
	    const game = await fetchGameData(gameUrl);
	    setGame(game);
	}

	if (gameUrl) {
	    get(gameUrl);
	}
    }, [gameUrl]);

    const [questionIdx, setQuestionIdx] = useState(0);
    const [answerChoice, setAnswerChoice] = useState();
    const [correctness1, setCorrectness1] = useState();
    const [correctness2, setCorrectness2] = useState();
    const [correctness3, setCorrectness3] = useState();
    const [correctness4, setCorrectness4] = useState();
    const [actionButtonEnabled, setActionButtonEnabled] = useState(false);
    const [quizButtonEnabled, setQuizButtonEnabled] = useState(true);

    const resetCorrectness = () => {
	setCorrectness1(null);
	setCorrectness2(null);
	setCorrectness3(null);
	setCorrectness4(null);
    };

    const isAnswerCorrect = (question, choice) => {
        return choice === question.correct_answer;
    };

    if (game && game.questions) {
	const questionCount = game.questions.length;
	const isLastQuestion = questionIdx + 1 === questionCount;
	const questionsLeft = questionIdx + 1 < questionCount;

	const currentQuestion = game.questions[questionIdx];

	const handleChoice = (choice) => {
            const isCorrect = isAnswerCorrect(currentQuestion, choice);
	    const v = isCorrect ? 'correct' : 'incorrect';
	    switch (choice) {
	    case 1: setCorrectness1(v); break;
	    case 2: setCorrectness2(v); break;
	    case 3: setCorrectness3(v); break;
	    case 4: setCorrectness4(v); break;
	    }
	}
	
	const navigateToNextQuestionOrFinish = () => {
            setActionButtonEnabled(false);
            setQuizButtonEnabled(false);
	    handleChoice(answerChoice);
	    setTimeout(() => {
                const wasLastQuestion = isLastQuestion;
		setQuestionIdx(questionIdx + 1);
		resetCorrectness();
                sendQuestionAnswer(currentQuestion.id, answerChoice);
                setQuizButtonEnabled(true);
	        setAnswerChoice(null);
	        if (wasLastQuestion) {
                    onComplete();
	        }
	    }, navigationTimeout);
	}

	const setChoice = (choice) => {
	    setAnswerChoice(choice);
            setActionButtonEnabled(true);
	}

        let actionButtonMessage;
        if (isLastQuestion) {
            actionButtonMessage = "Finish game";
        } else if (answerChoice) {
            actionButtonMessage = "Next question";
        } else {
            actionButtonMessage = "Select answer";
        }

	return (
	    <>
		<Box id="question-answers">
		    <h1>{ currentQuestion.question }</h1>
		    <Grid id="answer-buttons" container spacing={2}>
			<Grid size={6}>
			    <QuizButton answerIdx={1}
					label={"A: " + currentQuestion.answer_1}
					answerChoice={answerChoice} onChoice={setChoice}
					correctness={correctness1}
                                        disabled={!quizButtonEnabled} />
			</Grid>
			<Grid size={6}>
			    <QuizButton answerIdx={2}
					label={"B: " + currentQuestion.answer_2}
					answerChoice={answerChoice} onChoice={setChoice}
					correctness={correctness2}
                                        disabled={!quizButtonEnabled} />
			</Grid>
			<Grid size={6}>
			    <QuizButton answerIdx={3}
					label={"C: " + currentQuestion.answer_3}
					answerChoice={answerChoice} onChoice={setChoice}
					correctness={correctness3}
                                        disabled={!quizButtonEnabled} />
			</Grid>
			<Grid size={6}>
			    <QuizButton answerIdx={4}
					label={"D: " + currentQuestion.answer_4}
					answerChoice={answerChoice} onChoice={setChoice}
					correctness={correctness4}
                                        disabled={!quizButtonEnabled} />
			</Grid>
		    </Grid>
		</Box>
		<Button variant="outlined"
			disabled={!actionButtonEnabled}
			onClick={navigateToNextQuestionOrFinish}>
                    { actionButtonMessage }
                </Button>
	    </>
	);
    } else {
	return <CircularProgress/>;
    }
}
