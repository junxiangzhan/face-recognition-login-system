import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';

import { App } from './app';

const elements = (
    <HashRouter>
        <App />
    </HashRouter>
);

const root = createRoot(document.getElementById('root'));

root.render(
    <React.StrictMode>
        {elements}
    </React.StrictMode>
);