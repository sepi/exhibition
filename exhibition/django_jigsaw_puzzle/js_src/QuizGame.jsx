import React from 'react';
import { useState, useEffect } from 'react';

import QuizButton from './QuizButton.jsx';

import { Button, Box, CircularProgress, Container, Grid,
	 Stack, FormControl, FormControlLabel, RadioGroup } from '@mui/material';

const navigationTimeout = 3000;

export
function QuizGame({game, onComplete}) {
    const [questionIdx, setQuestionIdx] = useState(0);
    const [answerChoice, setAnswerChoice] = useState();
    const [correctness1, setCorrectness1] = useState();
    const [correctness2, setCorrectness2] = useState();
    const [correctness3, setCorrectness3] = useState();
    const [correctness4, setCorrectness4] = useState();

    const resetCorrectness = () => {
	setCorrectness1(null);
	setCorrectness2(null);
	setCorrectness3(null);
	setCorrectness4(null);
    }

    if (game.questions) {
	const questionCount = game.questions.length;
	const isLastQuestion = questionIdx + 1 === questionCount;
	const questionsLeft = questionIdx + 1 < questionCount;

	const currentQuestion = game.questions[questionIdx];

	const handleChoice = (choice) => {
	    setAnswerChoice(null);
	    const v = choice === currentQuestion.correct_answer ? 'correct' : 'incorrect';
	    switch (choice) {
	    case 1: setCorrectness1(v); break;
	    case 2: setCorrectness2(v); break;
	    case 3: setCorrectness3(v); break;
	    case 4: setCorrectness4(v); break;
	    }
	}
	
	const navigateToNextQuestion = () => {
	    if (questionsLeft) {
		handleChoice(answerChoice);
		setTimeout(() => {
		    setQuestionIdx(questionIdx + 1);
		    resetCorrectness();
		}, navigationTimeout);
	    }
	}

	const navigateBack = () => {
	    handleChoice(answerChoice);
	    // FIXME: Prevent multiple presses
	    setTimeout(onComplete, navigationTimeout);
	}

	const setChoice = (choice) => {
	    setAnswerChoice(choice);
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
					correctness={correctness1} />
			</Grid>
			<Grid size={6}>
			    <QuizButton answerIdx={2}
					label={"B: " + currentQuestion.answer_2}
					answerChoice={answerChoice} onChoice={setChoice}
					correctness={correctness2} />
			</Grid>
			<Grid size={6}>
			    <QuizButton answerIdx={3}
					label={"C: " + currentQuestion.answer_3}
					answerChoice={answerChoice} onChoice={setChoice}
					correctness={correctness3} />
			</Grid>
			<Grid size={6}>
			    <QuizButton answerIdx={4}
					label={"D: " + currentQuestion.answer_4}
					answerChoice={answerChoice} onChoice={setChoice}
					correctness={correctness4} />
			</Grid>
		    </Grid>
		</Box>
		{ !isLastQuestion && 
		  <Button variant="outlined"
			  disabled={!answerChoice}
			  onClick={navigateToNextQuestion}>Next question</Button>
		}
		{ isLastQuestion &&
		  <Button onClick={navigateBack}>Finish game</Button>
		}
	    </>
	);
    } else {
	return <CircularProgress/>;
    }
}
