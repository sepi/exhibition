import React from 'react';
import { useState, useEffect } from 'react';

import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';

import { DifficultySelector } from './DifficultySelector.jsx';

export function ImageSelectionPage({ setScreen, setPuzzlePieces,
				     setImage, images,
				     showSuccess, difficultyLevels }) {
    const [ showDifficultyModal, setShowDifficultyModal ] = useState(false);
    
    const switchToPuzzle = (rows, cols) => {
	setShowDifficultyModal(false);
	setPuzzlePieces([rows, cols]);
	setScreen('game');
    };
    
    const askDifficulty = (image) => {
	setImage(image);
	setShowDifficultyModal(true);
    };

    return (
	<>
	    <Modal
		open={showDifficultyModal}
		onClose={() => setShowDifficultyModal(false)}
		aria-labelledby="modal-modal-title"
		aria-describedby="modal-modal-description" >
	    <DifficultySelector difficultyLevels={difficultyLevels}
				onClick={(level) => switchToPuzzle(level.rows, level.columns)}/>
	    </Modal>
	    <Container style={{marginTop: 16}}>
		<ImageList cols={4}
			   // variant="masonry"
			   gap={12}>
		    {
			images ? images.map((image) => 
			    <ImageListItem key={image['original']}
					   onClick={(e) => askDifficulty(image)}
			    >
		    		<img src={image['thumbnail']}
				     alt={`poster with filename ${image}`}/>
		    	    </ImageListItem>) : null
		    }
		</ImageList>
	    </Container>
	</>
    );
}
