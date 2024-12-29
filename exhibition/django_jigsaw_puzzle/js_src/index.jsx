import React from 'react';
import ReactDOM from 'react-dom/client';

import './index.css';

import App from './App';

const rootEl = document.getElementById('jigsaw-puzzle');
// The API endpoint where to get images from
const imageUrl = rootEl.dataset.imageUrl;
// The title shown in navbar
const title = rootEl.dataset.title;
// The logo shown in navbar
const logoUrl = rootEl.dataset.logoUrl;
// Should image order be random?
const randomizeImages = (rootEl.dataset.randomizeImages.toLowerCase() == 'true');
// Show warning after no activity for this amount of seconds
const idleFirstSeconds = rootEl.dataset.idleFirstSeconds;
// If warning was shown for this amount of seconds, stop game.
const idleSecondSeconds = rootEl.dataset.idleSecondSeconds;
const copyrightNotice = rootEl.dataset.copyrightNotice;

const root = ReactDOM.createRoot(rootEl);
root.render(
    <React.StrictMode>
	<App imageUrl={imageUrl}
	     title={title}
	     logoUrl={logoUrl}
	     randomizeImages={randomizeImages}
	     idleFirstSeconds={idleFirstSeconds}
	     idleSecondSeconds={idleSecondSeconds}
	     copyrightNotice={copyrightNotice}
	/>
    </React.StrictMode>
);
