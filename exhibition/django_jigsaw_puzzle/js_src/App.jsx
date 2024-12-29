import React from 'react';
import { useState, useEffect } from 'react';

import Button from '@mui/material/Button';
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

// Global state because puzzle would initialize twice without this "Mutex"
window.pzleInitialied = undefined;
window.pzle = undefined;

const fetchImagePaths = async (imageUrl) => {
    const resp = await fetch(imageUrl);
    const images = await resp.json();
    let images2 = [];

    for (let image_id in images) {
	images2.push(images[image_id]);
    }
    
    return images2;
}

function App({imageUrl,
	      title,
	      logoUrl,
	      randomizeImages,
	      idleFirstSeconds,
	      idleSecondSeconds,
	      copyrightNotice}) {
    const [ screen, setScreen ] = useState("select_image");
    const [ images, setImages ] = useState([]);
    const [ puzzleImageUrl, setPuzzleImageUrl ] = useState();
    const [ puzzlePieces, setPuzzlePieces ] = useState();
    const [ showSuccess, setShowSucces ] = useState(false);
    const [ showInfo, setShowInfo ] = useState(false);
    const [ showHint, setShowHint ] = useState(false);
    const [ randomizer, setRandomizer ] = useState();

    useEffect(() => {
	const get = async ()=> {
	    const images_ = await fetchImagePaths(imageUrl);
	    const imagesRand = [];

	    if (randomizeImages) {
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
	if (randomizeImages) {
	    setRandomizer(Math.random()); // will re-fetch and randomize images in selection
	}
    };
    
    let back = null;
    if (screen === 'puzzle') {
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
		    setShowHint={setShowHint} />
	    <InfoDialog showInfo={showInfo}
			setShowInfo={setShowInfo}
			dialogTitle={"About Best of Posters puzzle"}/>
	    <HintDialog showHint={showHint}
			setShowHint={setShowHint}
			puzzleImageUrl={puzzleImageUrl} />
	    { screen === 'select_image' && images ?
	      <ImageSelectionPage setScreen={setScreen}
			  setPuzzleImageUrl={setPuzzleImageUrl}
			  setPuzzlePieces={setPuzzlePieces}
			  images={images}/> : null }
	    { screen === 'puzzle' ?
	      <PuzzlePage puzzleImageUrl={puzzleImageUrl}
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


export default App;
