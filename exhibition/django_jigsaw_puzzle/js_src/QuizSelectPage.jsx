import React from 'react';
import { useState, useEffect } from 'react';

import { Stack, Button } from '@mui/material';

export
function QuizSelectPage({games, onClick}) {
    return (
        <Stack alignItems="center" spacing={2}>
	    <h1>Select a quiz</h1>
	    {games.map((g) => {
		return (
		    <Button color="secondary"
                            variant="contained"
                            key={g.id}
                            sx={{minWidth: "35%"}}
			    onClick={() => onClick(g)}>{g.name}</Button>
		);
	    })}
        </Stack>
    );
}
