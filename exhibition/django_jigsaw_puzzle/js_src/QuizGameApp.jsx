import React from 'react';
import { useState, useEffect } from 'react';

import { Alert, Button, CircularProgress, Container, Snackbar, Stack } from '@mui/material';

import { Appbar } from './Appbar.jsx';
import { WelcomeScreen } from './WelcomeScreen.jsx';
import { MemoryGame } from './MemoryGame.jsx';
import { DifficultySelector } from './DifficultySelector.jsx';
import { CopyrightNotice } from './CopyrightNotice.jsx';
import { QuizGame } from './QuizGame.jsx';

import { fetchImagePaths, fetchGameData } from './api.js';

export default
function QuizGameApp({title, }) {
    const [screen, setScreen] = useState("loading");
    const [games, setGames] = useState([]);
    const [game, setGame] = useState();

    const gameUrl = '/games/quiz_game/';
    
    // Load game list from API
    useEffect(() => {
	const get = async ()=> {
	    const games = await fetchGameData(gameUrl);
	    setGames(games);
	    setScreen("select");
	}

	get();
    }, []);

    // Load game detail from API when game selected
    useEffect(() => {
	const get = async (game_url) => {
	    const game = await fetchGameData(game_url);
	    setGame(game);
	}

	if (game && game.url) {
	    get(game.url);
	}
    }, [game]);

    const navigateToGameScreen = (game) => {
	setGame(game);
	setScreen("game");
    }

    const onComplete = () => {
	setScreen("completed");
    }

    return (
	<div className="App">
	    <Appbar title={title}
		    logoUrl={false}
		    onBack={false}
		    onShowInfo={false}
		    setShowHint={false}
		    navbarBackgroundColor={"white"} />
	    <Snackbar open={null} onClose={null}>
		<Alert severity="success"
		       variant="filled">
		    {`Success, you completed the game in ${1} turns! Tap back to try another one.`}
		</Alert>
	    </Snackbar>

	    <Container>
		<Stack>
		    { screen === 'loading' && 
		      <CircularProgress/>
		    }
		    { screen === 'select' &&
		      <>
			  <h1>Select a quiz</h1>
			  {games.map((g) => {
			      return (
				  <div key={g.id}>
				      <Button variant="outlined"
					      onClick={() => navigateToGameScreen(g)}>{g.name}</Button>
				  </div>
			      );
			  })}
		      </>
		    }
		    { screen === 'game' &&
		      <QuizGame game={game}
				onComplete={onComplete} />
		    }
		    { screen === 'completed' &&
		      <div>Completed</div>
		    }
		</Stack>
	    </Container>
	</div>
    );
}
