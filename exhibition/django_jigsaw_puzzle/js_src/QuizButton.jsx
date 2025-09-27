import React from 'react';
import { useState, useEffect } from 'react';

import { Button } from '@mui/material';

export default
function QuizButton({label, answerIdx, selected, onChoice, correctness, disabled, allowReset}) {
    // const [ selected, setSelected ] = useState(false);

    // useEffect(() => {
    //     if (!answerChoices.includes(answerIdx)) {
    //         setSelected(false);
    //     }
    // }, [answerChoices]);
    
    const toggleSelected = (state) => {
	if (allowReset || !selected) {
	    onChoice(answerIdx, !selected);
	    // setSelected(!selected);
	}
    }

    const classNameSel = selected ? "selected": "unselected";

    let classNameCorr = '';
    if (correctness === 'correct' || correctness === 'incorrect') {
        classNameCorr = correctness;
    }

    const className = `quiz-button ${classNameSel} ${classNameCorr}`;

    const clickHandler = disabled ? null : toggleSelected;
    
    return (
	<div onClick={clickHandler}
             className={className}
             style={{
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 cursor: disabled ? 'wait' : 'pointer',
                 width: '100%', // Adjust as needed or make dynamic
                 height: 80,
             }} >
            <span
                style={{
                    color: 'white',
                    pointerEvents: 'none',
                    userSelect: 'none',
                    }}
                >
                {label}
            </span>
        </div>
    );
}
