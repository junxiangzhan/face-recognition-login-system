import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';

import { LoginForm } from './pages/login-form';
import { RegisterForm } from './pages/register-form';

const elements = (
    <HashRouter>
        <Routes>
            <Route path="/" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
        </Routes>
    </HashRouter>
);

const root = createRoot(document.getElementById('root'));

root.render(
    <React.StrictMode>
        {elements}
    </React.StrictMode>
);