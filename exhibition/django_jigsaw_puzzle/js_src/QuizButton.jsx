import React from 'react';
import { useState, useEffect } from 'react';

import { Button } from '@mui/material';

export default
function QuizButton({label, answerIdx, answerChoice, onChoice, correctness}) {
    const [ selected, setSelected ] = useState(false);

    useEffect(() => {
	if (answerChoice !== answerIdx) {
	    setSelected(false);
	}
    }, [answerChoice]);
    
    const toggleSelected = (state) => {
	if (!selected) {
	    onChoice(answerIdx);
	    setSelected(!selected);
	}
    }

    const buttonVariant = selected ? "contained" : "outlined";
    const classNameSel = selected ? "selected": "unselected";

    var className;
    if (correctness === 'correct' || correctness === 'incorrect') {
	className = correctness;
    } else {
	className = '';
    }

    return (
	<Button onClick={toggleSelected}
		variant={buttonVariant}
		size={'large'}
		className={`${className} ${classNameSel}` }>{label}</Button>
    );
}
