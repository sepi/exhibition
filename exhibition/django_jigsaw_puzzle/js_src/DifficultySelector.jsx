import React from 'react';

import Box from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

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

export function DifficultySelector({difficultyLevels, onClick}) {
    return (
	<Box sx={modalStyle}>
	    <Typography id="modal-modal-title" variant="h6" component="h2">
		Select the difficulty
	    </Typography>
	    <Stack spacing={2}>
		{difficultyLevels.map(level => 
		    <Button variant="outlined"
                            key={level.name}
			    onClick={() => onClick(level)}>{`${level.name} (${level.rows} x ${level.columns} = ${level.rows * level.columns} pieces)`}</Button>
		)}
	    </Stack>
	</Box>
    );
}
