import * as React from "react";
import axios from "axios";

import { storage } from "../app";

interface userInfo {
    name: string;
    birth: number;
    email: string;
    nickname?: string;
    profile?: string;
    log: Array<{
        content: string;
        timestamp: string;
    }>;
}
export const UserInfo: React.FunctionComponent = function () {

    const [userName, setUserName] = React.useState<string>(storage.getItem('username'));
    const [userInfo, setUserInfo] = React.useState<userInfo>(storage.getItem('user-info'));

    React.useEffect(function () {
        const callback = storage.addListener(function () {
            const userInfo = storage.getItem('user-info');
            const userName = storage.getItem('user-name');
            setUserInfo(userInfo);
            setUserName(userName);
        });

        return function () {
            storage.removeListener(callback);
        };
    }, []);

    React.useEffect(function () {
        const userName = storage.getItem('username');
        const userToken = storage.getItem('token');

        axios.get(userName, {
            headers: { token: userToken }
        }).then(
            res => {
                storage.setItem('user-info', res.data);
            },
            err => {
                console.error(err)
            }
        );
    }, []);

    return userInfo ? (
        <div className="user">
            <div className="user-info">
                {
                    userInfo.profile ? (
                        <img className="image-profile" src={userInfo.profile} />
                    ) : (
                        <div className="image-profile">
                            <span className="user-icon" />
                        </div>
                    )
                }

                <div className="user-summary">
                    <div className="user-name">
                        {
                            userInfo.nickname ? (
                                <span>{userInfo.nickname}</span>
                            ) : (
                                null
                            )
                        }
                        <span>{userInfo.name}</span>
                    </div>
                    <div className="user-email"><span className="email-icon" />{userInfo.email}</div>
                    <div className="user-birth"><span className="birth-icon" />{userInfo.birth}</div>
                </div>
            </div>
            <div className="user-log">
                {
                    userInfo.log.map(function (item, index: number) {
                        return (
                            <div key={index} className="user-log-item">
                                <div className="user-log-content">{item.content}</div>
                                <div className="user-log-timestamp">{item.timestamp}</div>
                            </div>
                        );
                    })
                }
            </div>
        </div>
    ) : (
        <div>Loading</div>
    );
}