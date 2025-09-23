import React from 'react';
import { useState, useEffect } from 'react';

import { Alert, Button, CircularProgress, Container, Snackbar, Stack } from '@mui/material';

import { Appbar } from './Appbar.jsx';
import { WelcomeScreen } from './WelcomeScreen.jsx';
import { MemoryGame } from './MemoryGame.jsx';
import { DifficultySelector } from './DifficultySelector.jsx';
import { CopyrightNotice } from './CopyrightNotice.jsx';
import { QuizGamePage } from './QuizGamePage.jsx';
import { QuizResultPage } from './QuizResultPage.jsx';

import { fetchGameData, startGameSession, endGameSession } from './api.js';

export default
function QuizGameApp({indexUrl, title, gameId}) {
    const [screen, setScreen] = useState("loading");
    const [games, setGames] = useState([]);
    const [gameUrl, setGameUrl] = useState();
    const [gameSessionId, setGameSessionId] = useState();

    const navigateToSelect = () => {
	setScreen("select");
    };

    const navigateToGameScreen = (gameUrl) => {
	setScreen("game");
	setGameUrl(gameUrl);
    };

    const onGameComplete = () => {
	setScreen("results");
        endGameSession(gameSessionId);
    };

    // Load game list from API
    useEffect(() => {
        const get = async () => {
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

    // Start session whenever a new game is selected
    useEffect(() => {
        const get = async (gameId) => {
            const gameSession = await startGameSession(gameId);
            setGameSessionId(gameSession.game_session_id);
        }

        if (gameUrl) {
            const components = gameUrl.split('/');
            const cLen = components.length;
            const id = components[cLen-2];
            get(id);
        }
    }, [gameUrl]);

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
		{ screen === 'loading' && 
		  <CircularProgress/>
		}
		{ screen === 'select' &&
                  <Stack alignItems="center" spacing={2}>
		      <h1>Select a quiz</h1>
		      {games.map((g) => {
			  return (
			      <Button color="secondary"
                                      variant="contained"
                                      key={g.id}
                                      sx={{minWidth: "35%"}}
				      onClick={() => navigateToGameScreen(g.url)}>{g.name}</Button>
			  );
		      })}
                  </Stack>
		}
		{ screen === 'game' &&
		  <QuizGamePage gameUrl={gameUrl}
			        onComplete={onGameComplete} />
		}
                { screen === 'results' &&
                  <QuizResultPage gameSessionId={gameSessionId}
                                  onComplete={navigateToSelect} />
                }
	    </Container>
	</div>
    );
}
