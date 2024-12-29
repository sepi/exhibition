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


export function ImageSelectionPage({ setScreen, setPuzzlePieces,
				     setPuzzleImageUrl, images,
				     showSuccess, difficultyLevels }) {
    const [ showDifficultyModal, setShowDifficultyModal ] = useState(false);
    
    const switchToPuzzle = (rows, cols) => {
	setShowDifficultyModal(false);
	setPuzzlePieces([rows, cols]);
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
			{difficultyLevels.map(level => 
			      <Button variant="outlined"
                                      key={level.name}
				      onClick={() => switchToPuzzle(level.rows, level.columns)}>{`${level.name} (${level.rows} x ${level.columns} = ${level.rows * level.columns} pieces)`}</Button>
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
