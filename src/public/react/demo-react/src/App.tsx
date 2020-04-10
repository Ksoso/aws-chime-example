import React, {useEffect} from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import MainWindow from './MainWindow';
import socket from './Socket';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import routes from './routes';
import MeetingRoom from './meeting/views/MeetingRoom';
import {createMuiTheme, ThemeProvider} from '@material-ui/core';

const theme = createMuiTheme();

const App: React.FC = () => {

    const [wsConnected, setWSConnected] = React.useState(false);

    useEffect(() => {
        socket.connect('http://127.0.0.1:3001', connected => setWSConnected(connected));
        return () => {
            socket.disconnect();
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
                        </Route>
                    </Switch>
                </Router>
            </ThemeProvider>
        </>
    );
};

export default App;
