import { useState, useEffect } from 'react';

export
function useTimeout(showModal, clear,
		    firstTimeout, secondTimeout) {
    const [ showTimeoutModal, setShowTimeoutModal ] = useState(false);
    const [ lastAction, setLastAction ] = useState(new Date());

    const resetTimeout = () => {
	const now = new Date();
	setLastAction(now);
	setShowTimeoutModal(false);
    }
    
    // Every second
    useEffect(() => {
	const interval = setInterval(() => {
	    const now = new Date();
	    const delta = now - lastAction;
	    // console.log(delta/1000);

	    // Second timeout occured, remove modal and clear screen.
	    if (delta/1000 > secondTimeout && showTimeoutModal) {
		const now = new Date();
		setLastAction(now);

		setShowTimeoutModal(false);
		clear();
	    // First timeout occured, show warning.
	    } else if (delta/1000 > firstTimeout && !showTimeoutModal) {
		setShowTimeoutModal(true);
		showModal(resetTimeout);
	    }
	}, 1000);

	return () => {
	    clearInterval(interval);
	}
    }, [lastAction, showTimeoutModal]);

    return [resetTimeout, showTimeoutModal];
}
