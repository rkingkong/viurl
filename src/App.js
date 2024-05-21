import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import PostForm from './components/PostForm';
import Feed from './components/Feed';
import Profile from './components/Profile';
import Notifications from './components/Notifications';

const App = () => {
    const [userId, setUserId] = useState(null);

    const handleLogin = (id) => {
        setUserId(id);
    };

    return (
        <Router>
            <div>
                <h1>Viurl</h1>
                {!userId ? (
                    <div>
                        <Register />
                        <Login onLogin={handleLogin} />
                    </div>
                ) : (
                    <div>
                        <PostForm userId={userId} />
                        <Feed />
                        <Switch>
                            <Route path="/profile/:userId" component={() => <Profile userId={userId} />} />
                            <Route path="/notifications" component={() => <Notifications userId={userId} />} />
                        </Switch>
                    </div>
                )}
            </div>
        </Router>
    );
};

export default App;
