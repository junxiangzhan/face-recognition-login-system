import * as React from "react";
import { Link, Outlet } from "react-router-dom";
import { storage } from "../app";

export const Homepage: React.FunctionComponent = function () {

    function Logout(event: React.MouseEvent) {
        event.preventDefault();
        storage.deleteItem('token');
    }

    return (
        <div className="homepage">
            <nav className="navbar">
                <Link className="navbar-link" to="/">使用者</Link>
                {/* <Link className="navbar-link" to="/settings">設定</Link> */}
                <span className="navbar-space"></span>
                <a className="navbar-link navbar-logout" href="/logout" onClick={Logout}>登出</a>
            </nav>
            <div className="page">
                <Outlet />
            </div>
        </div>
    );
}