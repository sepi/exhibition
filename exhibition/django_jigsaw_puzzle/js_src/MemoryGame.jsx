import React from 'react';
import { useState, useEffect } from 'react';

export function MemoryGame({randomImages, pieces, onWin}) {
    const [rows, cols] = pieces;

    const [flipFirst, setFlipFirst] = useState();
    const [flipSecond, setFlipSecond] = useState();
    const [flipBackTimeout, setFlipBackTimeout] = useState();
    const [locked, setLocked] = useState(false);
    const [flipCount, setFlipCount] = useState(0);
    const [showRevealedImages, setShowRevealedImages] = useState(false);

    // Only show the real images once first animation is finished.
    // The 600ms are synchrized with the animation duration in static/css/django_jigsaw_puzzle.css
    useEffect(() => {
	setTimeout(() => {
	    setShowRevealedImages(true);
	}, 600);
    }, []);

    function getEl(prefix, rowCol) {
	const [row, col] = rowCol;
	return document.getElementById(`${prefix}-${row}-${col}`);
    }

    function checkGameFinished() {
	for (let row = 0; row < rows; ++row) {
	    for (let col = 0; col < cols; ++col) {
		const frontEl = getEl('front', [row, col]);
		if (!frontEl.classList.contains('card-locked')) {
		    return false;
		}
	    }
	}
	return true;
    }

    function flipReveal(ev) {
	// Locking needed to prevent flipping new cards while still
	// waiting to flip back.
	if (locked) return; 
	
	const [frontBack, row, col] = ev.target.id.split("-");
	const inner = getEl('inner', [row, col]);

	const turnBackTimeout = 1600;
	const flipDuration = 600;

	setFlipCount((prev) => prev+1);
	
	if (!flipFirst) { // First card flipped
	    inner.classList.add("flip-reveal");
	    setFlipFirst([row, col]);
	} else if (!flipSecond) { // Second card flipped
	    setLocked(true);

	    const firstEl = getEl('front', flipFirst);
	    const secondEl = getEl('front', [row, col]);

	    // Clicked same card twice. Can happen when clicking fast
	    if (flipFirst[0] === row && flipFirst[1] === col) {
		console.log("clicked same twice");
		return;
	    }

	    inner.classList.add("flip-reveal");
	    setFlipSecond([row, col]);

	    // Well done: same image
	    if (firstEl.src === secondEl.src) {
		setFlipBackTimeout(setTimeout(() => {
		    firstEl.classList.add("card-locked");
		    secondEl.classList.add("card-locked");
		    setLocked(false);

		    if (checkGameFinished()) {
			onWin(flipCount);
		    }
		}, flipDuration));
	    } else { // Nope, flip back soon
		setFlipBackTimeout(setTimeout(() => {
		    flipHide(flipFirst[0], flipFirst[1]);
		    flipHide(row, col);
		    setLocked(false);
		}, turnBackTimeout));
	    }

	    setFlipFirst(undefined);
	    setFlipSecond(undefined);		
	}
    }

    function flipHide(row, col) {
	const inner = document.getElementById(`inner-${row}-${col}`);
	inner.classList.remove("flip-reveal");
    }

    return (
	<div className="memory-container">
	    <div className="card-area"
		 style={{gridTemplateColumns: `repeat(${cols}, auto)`}}>
		{ [...Array(rows).keys()].map((row) =>
		    [...Array(cols).keys()].map((col) => {
			let front_image_src = "/static/django_jigsaw_puzzle/images/card-unknown.svg";
			if (randomImages.length !== 0 && showRevealedImages) {
			    front_image_src = randomImages[row][col];
			}
			return (
			    <div className="card"
				 key={"card-"+row+"-"+col}>
				<div className="card-inner"
				     id={"inner-"+row+"-"+col}
			    	     key={"card-inner-"+row+"-"+col}>
				    <img id={"back-"+row+"-"+col}
					 key={"back-"+row+"-"+col}
					 className="card-back"
					 src="/static/django_jigsaw_puzzle/images/card-back.svg"
			    		 onClick={flipReveal}
					 draggable={false}
				    />
				    <img id={"front-"+row+"-"+col}
					 key={"front-"+row+"-"+col}
					 className="card-front"
					 src={front_image_src}
					 draggable={false}
				    />
				</div>
			    </div>
			);
		    })
		)}
	    </div>
	</div>
    );
}
