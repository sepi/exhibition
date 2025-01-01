import React from 'react';

import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

export function WelcomeScreen({next}) {
    return (
	<Container>
	    <Typography
		variant="h3">
		Welcome to MEMORY
	    </Typography>
	    <Button variant="outlined"
		    onClick={next}>{"Start game"}</Button>
	</Container>
    );
}
