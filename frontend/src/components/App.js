import React, { useState } from "react";
import TopBar from "./TopBar";
import Main from "./Main";

import {TOKEN_KEY} from "../constants";
import "../styles/App.css";


function App() {



    //搞了一个 isLoggedIn 状态好setState方法 并且传给topbar
    //localStorage 是为了 persistent 登录
    const [isLoggedIn, setIsLoggedIn] = useState(
        localStorage.getItem(TOKEN_KEY) ? true : false
        /*
       * JS: false, 0, undefined, NaN, "" or null
       * true: 字符串为真
       * */
    );



    const logout = () => {
        console.log("log out");
        localStorage.removeItem(TOKEN_KEY);
        setIsLoggedIn(false);
    };



    const loggedIn = (token) => {
        if (token) {
            localStorage.setItem(TOKEN_KEY, token);
            setIsLoggedIn(true);
        }
    };



    return (
        <div className="App">
            <TopBar isLoggedIn={isLoggedIn} handleLogout={logout} />
            <Main isLoggedIn={isLoggedIn}   handleLoggedIn={loggedIn}/>
        </div>
    );


}

export default App;
