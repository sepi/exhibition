import React from 'react';
import { useState, useEffect } from 'react';

import { Alert, Button, CircularProgress, Container, Snackbar, Stack } from '@mui/material';

import { Appbar } from './Appbar.jsx';
import { ModalDialog } from './ModalDialog.jsx';
import { useTimeout } from './useTimeout.js';
import { QuizSelectPage } from './QuizSelectPage.jsx';
import { QuizGamePage } from './QuizGamePage.jsx';
import { QuizResultPage } from './QuizResultPage.jsx';

import { fetchGameData, startGameSession, endGameSession } from './api.js';

export default
function QuizGameApp({indexUrl, gameId}) {
    const [screen, setScreen] = useState("loading");
    const [games, setGames] = useState([]);
    const [gameUrl, setGameUrl] = useState();
    const [gameSessionId, setGameSessionId] = useState();
    const [reloadCount, setReloadCount] = useState(0);
    const [title, setTitle] = useState("Quiz game");

    const [ resetTimeout, showTimeoutModal ] = useTimeout(null, () => {
        navigateToSelect();
    }, 300, 330); // 5min and 5:30min


    const navigateToSelect = () => {
        setReloadCount((reloadCount) => reloadCount + 1);
	setScreen("select");
    };

    const navigateToGameScreen = (gameUrl) => {
        resetTimeout();
	setScreen("game");
	setGameUrl(gameUrl);
    };

    const onGameComplete = () => {
        resetTimeout();
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
    }, [reloadCount]);

    // Hack so that timout is deactivated on select screen
    useEffect(() => {
        const interval = setInterval(() => {
            if (screen === 'select') {
                resetTimeout()
            }
        }, 5000);

        return () => clearInterval(interval); 
    }, [screen]);

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
    }, [gameUrl, reloadCount]);

    return (
	<div className="App">
	    <Appbar title={title}
		    logoUrl={false}
		    onBack={false}
		    onShowInfo={false}
		    setShowHint={false}
		    navbarBackgroundColor={"white"} />
	    <Container>
                <ModalDialog
		    show={showTimeoutModal}
		    setShow={null}
		    title={"Are you still playing"}
		    rawBody={"You didn't play for some time now. Dou you still want to continue to play?"}
		    actions={[{
                        type: 'callback',
                        caption: "Continue quiz!",
                        callback: resetTimeout
                    }]}
	        />

		{ screen === 'loading' && 
		  <CircularProgress/>
		}
		{ screen === 'select' &&
                  <QuizSelectPage games={games}
                                  onClick={(game) => navigateToGameScreen(game.url)} />
		}
		{ screen === 'game' &&
		  <QuizGamePage gameUrl={gameUrl}
			        onComplete={onGameComplete}
                                resetTimeout={resetTimeout}
                                setTitle={setTitle} />
		}
                { screen === 'results' &&
                  <QuizResultPage gameSessionId={gameSessionId}
                                  onComplete={navigateToSelect} />
                }
	    </Container>
	</div>
    );
}
