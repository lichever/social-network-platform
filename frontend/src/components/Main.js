import React from "react";
import { Route, Switch, Redirect } from "react-router";

import Login from "./Login";
import Register from "./Register";
import Home from "./Home";

function Main(props) {


    const { isLoggedIn, handleLoggedIn } = props;


    const showLogin=()=>{
// case1: already logged in -> show home page
// case2: has not logged in -> show login page
// 用render传递history，需要在render里面的实例化的组件传props
// 3种跳转方式  在route 或者 render 里面用 Redirect， 在函数里面用 history.push， 在标签里面 Link
        return isLoggedIn? <Redirect to ="/home" /> : <Login handleLoggedIn={handleLoggedIn} />

    }

    const showHome = () => {
        return isLoggedIn ? <Home /> : <Redirect to="/login" />;
    };

    //有参数传递 用render={call back function}
    //无参数传递 用component 无实例化 传不了参数
    return (
        <div className="main">
            <Switch>
                <Route path="/"  exact render={showLogin} />
                <Route path="/login" render={showLogin} />
                <Route path="/register" component={Register} />
                <Route path="/home" render={showHome} />
            </Switch>
        </div>
    );
}


export default Main;