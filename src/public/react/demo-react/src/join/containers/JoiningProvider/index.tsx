import React, {createContext, Dispatch, useEffect, useReducer} from 'react';
import {useHistory} from 'react-router-dom';
import socket from '../../../Socket';
import {Action, initialState, reducer, State, Type} from './reducer';
import bindSocketEvents from './socket/events';

const JoiningProviderDispatcher = createContext<Dispatch<Action>>(() => {
});
const JoiningProviderState = createContext<State>({} as State);

const JoiningProvider: React.FC = ({children}) => {
    const history = useHistory();
    const [state, dispatch] = useReducer<React.Reducer<State, Action>>(reducer, initialState);

    useEffect(() => {
        let unbind: () => void;
        socket.connect('http://127.0.0.1:3001', connected => {
            dispatch({
                type: Type.WsConnected,
                connected
            });
            unbind = bindSocketEvents(socket, dispatch);
        });
        return () => {
            unbind();
            socket.disconnect();
        };
    }, []);

    return <JoiningProviderState.Provider value={state}>
        <JoiningProviderDispatcher.Provider value={dispatch}>
            {children}
        </JoiningProviderDispatcher.Provider>
    </JoiningProviderState.Provider>;
};

export function useJoiningProviderDispatcher(): Dispatch<Action> {
    return React.useContext(JoiningProviderDispatcher);
}

export function useJoiningProviderState(): State {
    return React.useContext(JoiningProviderState);
}

export default JoiningProvider;
