import React from 'react';
import { useState, useEffect } from 'react';

import QuizButton from './QuizButton.jsx';

import { Button, Box, CircularProgress, Container, Grid, LinearProgress,
	 Stack, FormControl, FormControlLabel, RadioGroup } from '@mui/material';

import ArrowForward from '@mui/icons-material/ArrowForward';

import { fetchGameData, sendQuestionAnswers } from './api.js';

function isAnswerCorrect(question, choice) {
    switch (choice) {
    case 1: return question.correct_1;
    case 2: return question.correct_2;
    case 3: return question.correct_3;
    case 4: return question.correct_4;
    }
};

export
function QuizGamePage({gameUrl, onComplete, resetTimeout, setTitle}) {
    const [game, setGame] = useState();

    // Load game detail including questions from API when game selected
    useEffect(() => {
	const get = async (gameUrl) => {
	    const game = await fetchGameData(gameUrl);
	    setGame(game);
            setTitle(game.name);
	}

	if (gameUrl) {
	    get(gameUrl);
	}
    }, [gameUrl]);

    const [questionIdx, setQuestionIdx] = useState(0); // Current question
    const [answerChoices, setAnswerChoices] = useState([]); // The selected answers
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

    if (game && game.questions) {
        const allowMultipleAnswers = game.allow_multiple_answers;

	const questionCount = game.questions.length;
	const isLastQuestion = questionIdx + 1 === questionCount;
	const questionsLeft = questionIdx + 1 < questionCount;

	const currentQuestion = game.questions[questionIdx];

	const handleChoice = (choices) => {
            setCorrectness1(isAnswerCorrect(currentQuestion, 1)  ? 'correct' : 'incorrect');
            setCorrectness2(isAnswerCorrect(currentQuestion, 2)  ? 'correct' : 'incorrect');
            setCorrectness3(isAnswerCorrect(currentQuestion, 3)  ? 'correct' : 'incorrect');
            setCorrectness4(isAnswerCorrect(currentQuestion, 4)  ? 'correct' : 'incorrect');
	}
	
	const navigateToNextQuestionOrFinish = () => {
            resetTimeout()
            setActionButtonEnabled(false);
            setQuizButtonEnabled(false);
	    handleChoice(answerChoices);
            sendQuestionAnswers(currentQuestion.id, answerChoices);

	    setTimeout(() => {
                const wasLastQuestion = isLastQuestion;
		setQuestionIdx(questionIdx + 1);
		resetCorrectness();
                setQuizButtonEnabled(true);
	        setAnswerChoices([]);
	        if (wasLastQuestion) {
                    onComplete();
	        }
	    }, game.next_question_timeout * 1000);
	}

	const setChoices = (answerIdx, newChoice) => {
            resetTimeout();
	    setAnswerChoices(answerChoices => {
                const n = Array.from(answerChoices);
                if (allowMultipleAnswers) {
                    if (newChoice === true &&
                        !n.includes(answerIdx)) {
                        n.push(answerIdx);
                    }
                    if (newChoice === false &&
                        n.includes(answerIdx)) {
                        const index = n.indexOf(answerIdx);
                        if (index > -1) {
                            n.splice(index, 1);
                        }
                    }
                    return n;
                } else {
                    if (newChoice) {
                        return [answerIdx];
                    } else {
                        return [];
                    }
                }
            });

            // FIXME: This should depend on a config. Do we want to
            // allow to send answers with all false.
            setActionButtonEnabled(true);
	}

        let actionButtonMessage;
        if (isLastQuestion) {
            actionButtonMessage = "Finish game";
        } else if (answerChoices) {
            actionButtonMessage = "Next question";
        } else {
            actionButtonMessage = "Select answer";
        }

        const quizProgress = (questionIdx + 0.5) / questionCount * 100;
        const justify = {display:'flex', justifyContent: 'center'};

        // Specification for answer button markup
        const buttons = [
            {'index': 1, 'label': "A: " + currentQuestion.answer_1,
             'selected': answerChoices.includes(1), 'correctness': correctness1},
            {'index': 2, 'label': "B: " + currentQuestion.answer_2,
             'selected': answerChoices.includes(2), 'correctness': correctness2},
            {'index': 3, 'label': "C: " + currentQuestion.answer_3,
             'selected': answerChoices.includes(3), 'correctness': correctness3},
            {'index': 4, 'label': "D: " + currentQuestion.answer_4,
             'selected': answerChoices.includes(4), 'correctness': correctness4},
        ];
        

	return (
	    <Stack spacing={3} sx={{width: "100%"}}>
		<h4>{ currentQuestion.question }</h4>
		<Grid id="answer-buttons"
                      container spacing={0}>
                    { buttons.map((b) =>
		        <Grid item
                              key={b.index}
                              xs={6}
                              sx={justify}>
		            <QuizButton answerIdx={b.index}
		        	        label={b.label}
                                        onChoice={setChoices}
		        	        selected={b.selected}
		        	        correctness={b.correctness}
                                        disabled={!quizButtonEnabled}
                                        allowReset={true} />
		        </Grid>
                    )}
		</Grid>
                <Grid container
                      justifyContent='space-between'
                      alignItems='flex-end'>
                    <div>{ questionIdx + 1 } / { questionCount }</div>
                    <Grid item xs={3}>
	                <Button variant={'contained'}
                                color={'secondary'}
                                size={'large'}
		                disabled={!actionButtonEnabled}
		                onClick={navigateToNextQuestionOrFinish}
                                sx={{width: "100%"}}
                                endIcon={<ArrowForward/>}>
                            { "" }
                        </Button>
                    </Grid>
                </Grid>
                <LinearProgress variant="determinate"
                                value={ quizProgress }
                                color="secondary" />
	    </Stack>
	);
    } else {
	return <CircularProgress/>;
    }
}
