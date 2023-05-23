import * as React from "react";
import { Routes, Route } from 'react-router-dom';

import { LoginForm } from './pages/login-form';
import { RegisterForm } from './pages/register-form';
import { Homepage } from "./pages/homepage";
import { Navigate } from "react-router-dom";
import axios from "axios";

export const storage = new class {
    private eventTarget: EventTarget;
    private data: { [key: string]: any };
    private callbacks = new Set<[Function, () => unknown]>();

    constructor() {
        this.eventTarget = new EventTarget();
        this.data = JSON.parse(localStorage.getItem('data') ?? "{}");
    }

    addListener(callback: (this: this) => unknown) {
        const bindedCallback = callback.bind(this);
        this.callbacks.add([callback, bindedCallback]);
        this.eventTarget.addEventListener('', bindedCallback);
        return callback;
    }

    removeListener(callback: (this: this) => unknown) {
        this.callbacks.forEach((callbackPair) => {
            const [callbackInMemory, bindedCallback] = callbackPair;
            if (callback === callbackInMemory) {
                this.callbacks.delete(callbackPair);
                this.eventTarget.removeEventListener('', bindedCallback);
            }
        });
    }

    getItem(key: string): any {
        return this.data[key];
    }

    setItem(key: string, value: any) {
        this.data[key] = value;
        localStorage.setItem('data', JSON.stringify(this.data));
        this.eventTarget.dispatchEvent(new Event(''));
    }

    deleteItem(key: string): boolean {
        const result = delete this.data[key];
        localStorage.setItem('data', JSON.stringify(this.data));
        this.eventTarget.dispatchEvent(new Event(''));
        return result;
    }
};

export const App: React.FunctionComponent = function () {
    const [isTokenValid, setWheatherTokenIsValid] = React.useState<boolean>(false);

    const [userName, setUserName] = React.useState<string>(storage.getItem('username'));
    const [userToken, setUserToken] = React.useState<string>(userName && storage.getItem('token'));

    React.useEffect(function () {
        const callback = storage.addListener(function () {
            const token = this.getItem('token');
            const username = this.getItem('username');
            setUserToken(token);
            setUserName(username);

            setWheatherTokenIsValid(true);
        });

        return function () {
            storage.removeListener(callback);
        };
    }, []);

    React.useEffect(function () {
        if (userToken && !isTokenValid) {
            axios.get(userName, {
                headers: { token: userToken }
            }).then(
                res => {
                    storage.setItem('user-info', res.data);
                    setWheatherTokenIsValid(true);
                },
                err => {
                    storage.deleteItem('token');
                    storage.deleteItem('user-info');
                    storage.deleteItem('username');
                }
            );
        }
    }, []);

    return !userToken ? (
        <Routes>
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
    ) : !isTokenValid ? (
        <div>Loading</div>
    ) : (
        <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
}