import React, {useEffect} from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import MainWindow from './MainWindow';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import routes from './routes';
import MeetingRoom from './meeting/views/MeetingRoom';
import {createMuiTheme, ThemeProvider} from '@material-ui/core';
import JoiningRoom from './join/views/JoiningRoom';
import Settings from './meeting/views/Settings';
import MeetingManager from './meeting/MeetingManager';

const theme = createMuiTheme();

const App: React.FC = () => {

    const [wsConnected] = React.useState(false);

    useEffect(() => {
        return () => {
            MeetingManager.endMeeting();
        };
    }, []);

    return (
        <>
            <CssBaseline/>
            <ThemeProvider theme={theme}>
                <Router>
                    <Switch>
                        <Route path={routes.ROOT}>
                            <Route path={routes.ROOT} exact
                                   render={(props) => <MainWindow {...props}
                                                                  wsConnected={wsConnected}/>}/>
                            <Route path={routes.MEETING} component={MeetingRoom}/>
                            <Route path={routes.SETTINGS} component={Settings}/>
                            <Route path={routes.JOIN} component={JoiningRoom}/>
                        </Route>
                    </Switch>
                </Router>
            </ThemeProvider>
        </>
    );
};

export default App;
