import React from 'react';
import { useState, useEffect } from 'react';

import { Alert, Button, CircularProgress, Container, Snackbar, Stack } from '@mui/material';

import { Appbar } from './Appbar.jsx';
import { WelcomeScreen } from './WelcomeScreen.jsx';
import { MemoryGame } from './MemoryGame.jsx';
import { DifficultySelector } from './DifficultySelector.jsx';
import { CopyrightNotice } from './CopyrightNotice.jsx';
import { QuizGame } from './QuizGame.jsx';

import { fetchGameData } from './api.js';

export default
function QuizGameApp({indexUrl, title, gameId}) {
    const [screen, setScreen] = useState("loading");
    const [games, setGames] = useState([]);
    const [gameUrl, setGameUrl] = useState();

    const navigateToGameScreen = (gameUrl) => {
	setScreen("game");
	setGameUrl(gameUrl);
    }

    const onComplete = () => {
	setScreen("completed");
    };

    // Load game list from API
    useEffect(() => {
        const get = async ()=> {
            const games = await fetchGameData(indexUrl);
            setGames(games);

            if (gameId === 'None') { // Game selection
                setScreen("select");
            } else { // Specific game
                const gameUrl = `${indexUrl}${gameId}/`;
                navigateToGameScreen(gameUrl);
            }
        }

        get();
    }, []);

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
					      onClick={() => navigateToGameScreen(g.url)}>{g.name}</Button>
				  </div>
			      );
			  })}
		      </>
		    }
		    { screen === 'game' &&
		      <QuizGame gameUrl={gameUrl}
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
