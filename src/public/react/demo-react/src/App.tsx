import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import routes from './routes';
import MeetingRoom from './meeting/views/MeetingRoom';
import {createMuiTheme, ThemeProvider} from '@material-ui/core';
import JoiningRoom from './join/views/JoiningRoom';
import Settings from './meeting/views/Settings';
import MeetingProvider from './shared';

const theme = createMuiTheme();

const App: React.FC = () => {

    return (
        <>
            <CssBaseline/>
            <ThemeProvider theme={theme}>
                <MeetingProvider>
                    <Router>
                        <Switch>
                            <Route path={routes.ROOT}>
                                <Route path={routes.ROOT} exact component={JoiningRoom}/>
                                <Route path={routes.MEETING} component={MeetingRoom}/>
                                <Route path={routes.SETTINGS} component={Settings}/>
                            </Route>
                        </Switch>
                    </Router>
                </MeetingProvider>
            </ThemeProvider>
        </>
    );
};

export default App;
