import * as React from 'react';
import { Link } from 'react-router-dom';
import Webcam from 'react-webcam';

import axios, { AxiosError } from 'axios';
import { StepItemContext, Steps } from '../components/steps';

export const RegisterForm: React.FunctionComponent = function () {

    const [username, setUsername] = React.useState<string>(null);
    const [images, setImages] = React.useState<Blob[]>([]);
    const captureCount = 5;

    React.useEffect(() => {
        if (!username || images.length < captureCount) return;
        const formdata = new FormData();
        formdata.append('username', username);
        images.forEach((image, index) => formdata.append('images', image, `${username}-${index}.jpg`));
        axios.post(`/${username}`, formdata);
    }, [username, images]);

    return (
        <div className="card">
            <img src="/static/google-logo.svg" alt="logo" style={{ width: 75 }} />
            <Steps>
                <StepOne setUsername={setUsername} />
                <StepTwo setImages={setImages} captureCount={captureCount} />
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
    setImages(images: Blob[]): void;
    captureCount: number;
    isWaiting?: boolean;
}
const StepTwo: React.FunctionComponent<StepTwoProps> = function (props: StepTwoProps): React.ReactElement {
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
                <button type="button" className="button button-primary" onClick={capture}>註冊並登入</button>
            </div>
        </div>
    );
}