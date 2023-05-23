import * as React from 'react';
import { Link } from 'react-router-dom';
import Webcam from 'react-webcam';

import axios, { AxiosError } from 'axios';
import { StepItemContext, Steps } from '../components/steps';
import { storage } from '../app';

const thisYear = new Date().getFullYear();

interface UserData {
    nickname?: string;
    birth?: number;
    email?: string;
}

export const RegisterForm: React.FunctionComponent = function () {

    const [username, setUsername] = React.useState<string>(null);
    const [userData, setUserData] = React.useState<UserData>({});
    const [images, setImages] = React.useState<Blob[]>([]);
    
    const [isWaiting, setWaitingState] = React.useState<boolean>(false);

    const captureCount = 5;

    React.useEffect(() => {
        if (!username || images.length < captureCount) return;
        const formdata = new FormData();
        formdata.append('username', username);
        formdata.append('userdata', JSON.stringify(userData));
        images.forEach((image, index) => formdata.append('images', image, `${username}-${index}.jpg`));

        setWaitingState(true);
        axios.post(`/${username}`, formdata).then(
            res => {
                storage.setItem('username', username);
                storage.setItem('token', res.data.token);
            }, 
            err => {
                alert('無法註冊，請重試。');
            }
        ).finally(
            () => {
                setWaitingState(false);
            }
        );
    }, [username, images]);

    return (
        <div className="card">
            <img src="/static/google-logo.svg" alt="logo" style={{ width: 75 }} />
            <Steps>
                <StepOne setUsername={setUsername} />
                <StepTwo setUserData={setUserData} />
                <StepThree isWaiting={isWaiting} setImages={setImages} captureCount={captureCount} />
            </Steps>
        </div>
    );
}

interface StepOneProps {
    setUsername(username: string): void;
}
const StepOne: React.FunctionComponent<StepOneProps> = function (props: StepOneProps): React.ReactElement {
    const enum StepOneState { isAvailable, isWaiting, isError }
    const [username, setUsername] = React.useState<string>();
    const { nextStep } = React.useContext(StepItemContext);
    const [state, setState] = React.useState(StepOneState.isAvailable);

    async function submit() {
        if (state !== StepOneState.isAvailable) return;
        setState(StepOneState.isWaiting);

        try {
            const res = await axios.get(`/${username}`);

            if (res.status === 200)
                setState(StepOneState.isError);
        } catch (err) {
            const { response: res } = err as AxiosError;

            if (res.status === 404) {
                props.setUsername(username);
                nextStep();
            }

            setState(StepOneState.isAvailable);
        }
    }

    function inputHandler(e: React.FormEvent<HTMLInputElement>) {
        const target = e.target as HTMLInputElement;
        const username = target.value.trim().toLowerCase();
        setUsername(username);

        if (state === StepOneState.isError)
            setState(StepOneState.isAvailable);
    }

    return (
        <>
            <h1>註冊</h1>
            <h2>使用臉部識別註冊</h2>
            <label className={"input-box" + (state === StepOneState.isError ? ' error' : '')}>
                <span className="input-placeholder">請輸入使用者帳號</span>
                <input type="text" className="input-element" placeholder=" " onInput={inputHandler} />
            </label>
            <div className="error-message">* 此帳戶已被使用。</div>
            <div className="card-text">此為課程作品，僅具備登入及註冊功能。此作品會要求啟用鏡頭，請允許權限。</div>
            <span className="card-spacer"></span>
            <div className="card-footer">
                <Link to="login" className="button button-secondary">登入帳戶</Link>
                <button type="button" className="button button-primary" disabled={!username || state !== StepOneState.isAvailable} onClick={submit}>下一步</button>
            </div>
        </>
    );
}


interface StepTwoProps {
    setUserData(userData: UserData): void;
}
const StepTwo: React.FunctionComponent<StepTwoProps> = function (props: StepTwoProps): React.ReactElement {
    const enum StepTwoState {EmailFormatError, BirthFormatError, EmptyError}

    const [nickname, setNickname] = React.useState<string>('');
    const [birth, setBirth] = React.useState<number>(0);
    const [email, setEmail] = React.useState<string>('');

    const [state, setState] = React.useState<Set<StepTwoState>>(new Set([StepTwoState.EmptyError]));

    const { prevStep, nextStep } = React.useContext(StepItemContext);

    function nicknameInputHandler(e: React.FormEvent<HTMLInputElement>) {
        const target = e.target as HTMLInputElement;
        const email = target.value.trim().toLowerCase();
        setNickname(email);
    }

    function emailInputHandler(e: React.FormEvent<HTMLInputElement>) {
        const target = e.target as HTMLInputElement;
        const email = target.value.trim().toLowerCase();
        setEmail(email);

        if (state.has(StepTwoState.EmailFormatError))
            setState(state => (state.delete(StepTwoState.EmailFormatError), new Set(state)));
    }

    function birthInputHandler(e: React.FormEvent<HTMLInputElement>) {
        const target = e.target as HTMLInputElement;
        const birth = target.valueAsNumber;
        setBirth(birth);

        if (state.has(StepTwoState.BirthFormatError))
            setState(state => (state.delete(StepTwoState.BirthFormatError), new Set(state)));
    }


    function submit() {
        if (state.size != 0) return;

        let error = state.size !== 0;

        if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
            setState(state => (state.add(StepTwoState.EmailFormatError), new Set(state)));
            error = true;
        }
            
        if (birth < 1900 || birth > thisYear) {
            setState(state => (state.add(StepTwoState.BirthFormatError), new Set(state)));
            error = true;
        }

        if (error) return;
        
        props.setUserData({
            nickname, birth, email
        })

        nextStep();
    }

    React.useEffect(function () {
        if (birth && email) {
            setState(state => (state.delete(StepTwoState.EmptyError), new Set(state)));
        } else {
            setState(state => (state.add(StepTwoState.EmptyError), new Set(state)));
        }
    }, [birth, email]);

    return (
        <>
            <h2>請輸入註冊資料</h2>
            <label className="input-box">
                <span className="input-placeholder">請輸入匿稱（可選）</span>
                <input type="text" className="input-element" placeholder=" " onInput={nicknameInputHandler} />
            </label>
            <label className={"input-box" + (state.has(StepTwoState.EmailFormatError) ? ' error' : '')}>
                <span className="input-placeholder">請輸入電子郵件</span>
                <input type="email" className="input-element" placeholder=" " onInput={emailInputHandler} />
            </label>
            <div className="error-message">* 電子郵件格式錯誤。</div>
            <label className={"input-box" + (state.has(StepTwoState.BirthFormatError) ? ' error' : '')}>
                <span className="input-placeholder">請輸入出生年份</span>
                <input type="number" min={1900} max={thisYear} className="input-element" placeholder=" " onInput={birthInputHandler} />
            </label>
            <div className="error-message">* 輸入年份應介於 1900 年至 {thisYear} 年之間。</div>
            <span className="card-spacer"></span>
            <div className="card-footer">
                <button type="button" className="button button-secondary" onClick={prevStep}>上一步</button>
                <button type="button" className="button button-primary" disabled={state.size !== 0} onClick={submit}>下一步</button>
            </div>
        </>
    );
}

interface StepThreeProps {
    setImages(images: Blob[]): void;
    captureCount: number;
    isWaiting?: boolean;
}
const StepThree: React.FunctionComponent<StepThreeProps> = function (props: StepThreeProps): React.ReactElement {
    const enum CaptureButtonState { isAvailable, isCapturing, waitingServer }
    const webcamRef = React.useRef(null);
    const { prevStep, isCurrent } = React.useContext(StepItemContext);
    const [captureButtonState, setCaptureButtonState] = React.useState(props.isWaiting ? CaptureButtonState.waitingServer : CaptureButtonState.isAvailable);

    async function capture() {
        if (captureButtonState !== CaptureButtonState.isAvailable) return;
        setCaptureButtonState(CaptureButtonState.isCapturing);

        const images: Blob[] = [];
        for (let i = 0; i < props.captureCount; i++) {
            if (!webcamRef.current) return;
            await new Promise(resolve => setTimeout(resolve, 200 * Math.random()));

            const src = webcamRef.current.getScreenshot();
            const image: Blob = await fetch(src).then(res => res.blob());
            images.push(image);
        }

        props.setImages(images);
        setCaptureButtonState(CaptureButtonState.isAvailable);
    }

    return (
        <div className="step-item">
            <div className="webcam-container">
                {
                    isCurrent() ? (
                        <Webcam
                            ref={webcamRef}
                            capture="user"
                            screenshotFormat="image/jpeg"
                            forceScreenshotSourceSize
                            mirrored
                        />
                    ) : (
                        null
                    )
                }
            </div>
            <div className="card-footer">
                <button type="button" className="button button-secondary" onClick={prevStep}>上一步</button>
                <button type="button" className="button button-primary" disabled={captureButtonState !== CaptureButtonState.isAvailable} onClick={capture}>註冊並登入</button>
            </div>
        </div>
    );
}