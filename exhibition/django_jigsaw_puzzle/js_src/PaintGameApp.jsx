import React from 'react';

import { PaintGame } from './PaintGame';

export default
function PaintGameApp(appProps) {
    return (
	<div className="App">
	    <PaintGame {...appProps} />
	</div>
    );
}

