import React from 'react';
import { useState, useEffect } from 'react';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';

import { Appbar } from './Appbar.jsx';
import { ImageSelectionPage } from './ImageSelectionPage.jsx';
import { PuzzlePage } from './PuzzlePage.jsx';
import { InfoDialog } from './InfoDialog.jsx';
import { HintDialog } from './HintDialog.jsx';
import { fetchImagePaths, fetchGameData } from './api.js';

// Global state because puzzle would initialize twice without this "Mutex"
window.pzleInitialied = undefined;
window.pzle = undefined;


function randImg(randomizeImages) {
    return randomizeImages.toLowerCase() == 'true';
}

export default
function JigsawPuzzleApp({gameUrl,
			  title,
			  logoUrl,
			  randomizeImages,
			  idleFirstSeconds,
			  idleSecondSeconds,
			  copyrightNotice,
			  navbarBackgroundColor}) {
    const [ screen, setScreen ] = useState("select_image");
    const [ images, setImages ] = useState([]);
    const [ image, setImage ] = useState();
    const [ puzzlePieces, setPuzzlePieces ] = useState([undefined, undefined]);
    const [ showSuccess, setShowSucces ] = useState(false);
    const [ showInfo, setShowInfo ] = useState(false);
    const [ showHint, setShowHint ] = useState(false);
    const [ randomizer, setRandomizer ] = useState();
    const [ difficultyLevels, setDifficultyLevels ] = useState([]);

    useEffect(() => {
	const get = async ()=> {
	    const game = await fetchGameData(gameUrl);
	    setDifficultyLevels(game.difficulty_levels);
	    const images_ = await fetchImagePaths(game.image_set_url+'?thumbnail_alias=thumbnail,puzzle,hint');
	    const imagesRand = [];

	    if (randImg(randomizeImages)) {
		do {
		    const randIdx = Math.floor(Math.random() * images_.length);
		    const img = images_[randIdx];
		    images_.splice(randIdx, 1);
		    imagesRand.push(img);
		} while (images_.length > 0);
		setImages(imagesRand);
	    } else {
		setImages(images_);
	    }
	}
	get();
    }, [randomizer]);

    const navigateToSelectScreen = () => {
	setScreen('select_image');
	setShowSucces(false);
	window.pzleInitialied = false;
	if (randImg(randomizeImages)) {
	    setRandomizer(Math.random()); // will re-fetch and randomize images in selection
	}
    };
    
    let back = null;
    if (screen === 'game') {
	back = navigateToSelectScreen;
    }

    const onComplete = (_state) => {
	setShowSucces(true);
	// navigateToSelectScreen();
    }

    return (
    	<div className="App">
	    <Appbar title={title}
		    logoUrl={logoUrl}
		    onBack={back}
		    onShowInfo={() => setShowInfo(true)}
		    setShowHint={screen === 'game' ? setShowHint : null}
		    navbarBackgroundColor={navbarBackgroundColor} />
	    <InfoDialog showInfo={showInfo}
			setShowInfo={setShowInfo}
			dialogTitle={"About Poster Puzzle"}/>
	    <HintDialog showHint={showHint}
			setShowHint={setShowHint}
			imageUrl={image ? image['hint'] : ''} />
	    { screen === 'select_image' && images ?
	      <ImageSelectionPage difficultyLevels={difficultyLevels}
				  setScreen={setScreen}
				  setImage={setImage}
				  setPuzzlePieces={setPuzzlePieces}
				  images={images}/> : null }
	    { screen === 'game' ?
	      <PuzzlePage puzzleImageUrl={image ? image['puzzle'] : ''}
			  puzzlePieces={puzzlePieces}
			  onComplete={onComplete}
	      		  showSuccess={showSuccess}
			  navigateToSelectScreen={navigateToSelectScreen}
			  initialZoom={1.4}
			  idleFirstSeconds={idleFirstSeconds}
			  idleSecondSeconds={idleSecondSeconds} 
	      /> : null }
	    <div style={{minHeight: 20,
			 textAlign: 'left',
			 paddingLeft: 8,
			 color: 'gray'}}>
		{ copyrightNotice }
	    </div>
	</div>
    );
}
