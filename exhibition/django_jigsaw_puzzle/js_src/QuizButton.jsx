import React from 'react';
import { useState, useEffect } from 'react';

import { Button } from '@mui/material';

export default
function QuizButton({label, answerIdx, answerChoice, onChoice, correctness, ...otherProps}) {
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

    const classNameSel = selected ? "selected": "unselected";

    let classNameCorr = '';
    if (correctness === 'correct' || correctness === 'incorrect') {
        classNameCorr = correctness;
    }

    const className = `quiz-button ${classNameSel} ${classNameCorr}`;

    return (
	<div onClick={toggleSelected}
             className={className}
             style={{
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 cursor: 'pointer',
                 width: '100%', // Adjust as needed or make dynamic
                 height: 80,
             }}
             {...otherProps}>
            <span
                style={{
                    color: 'white',
                    pointerEvents: 'none',
                    }}
                >
                {label}
            </span>
        </div>
    );
}
