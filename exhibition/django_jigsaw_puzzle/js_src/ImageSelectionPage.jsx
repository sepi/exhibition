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

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

const difficulties = [{label: 'Easy', pieces: 4},
		      {label: 'Medium', pieces: 6},
		      {label: 'Hard', pieces: 9},
		      {label: 'Very hard', pieces: 11}];

export function ImageSelectionPage({ setScreen, setPuzzlePieces, setPuzzleImageUrl, images, showSuccess }) {
    const [ showDifficultyModal, setShowDifficultyModal ] = useState(false);
    
    const switchToPuzzle = (pieces) => {
	setShowDifficultyModal(false);
	setPuzzlePieces(pieces);
	setScreen('puzzle');
    };
    
    const askDifficulty = (imageSrc) => {
	setPuzzleImageUrl(imageSrc);
	setShowDifficultyModal(true);
    };

    return (
	<>
	    <Modal
		open={showDifficultyModal}
		onClose={() => setShowDifficultyModal(false)}
		aria-labelledby="modal-modal-title"
		aria-describedby="modal-modal-description" >
		<Box sx={modalStyle}>
		    <Typography id="modal-modal-title" variant="h6" component="h2">
			Select the difficulty
		    </Typography>
		    <Stack spacing={2}>
			{difficulties.map(level => 
			      <Button variant="outlined"
                                      key={level.label}
				      onClick={() => switchToPuzzle(level.pieces)}>{`${level.label} (${level.pieces} x ${level.pieces} = ${level.pieces * level.pieces} pieces)`}</Button>
			  )}
		    </Stack>
		</Box>
	    </Modal>
	    <Container>
		<ImageList cols={4}
			   // variant="masonry"
			   gap={12}>
		    {
			images ? images.map((image) => 
			    <ImageListItem key={image['original']}
					   onClick={(e) => askDifficulty(image['puzzle'])}
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
