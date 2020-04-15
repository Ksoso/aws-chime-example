import React, {createContext, Dispatch, useEffect, useReducer} from 'react';
import {Action, initialState, reducer, State} from './reducer';
import bindSocketEvents from './socket/events';
import {useMeetingProviderState} from '../../../shared';

const JoiningProviderDispatcher = createContext<Dispatch<Action>>(() => {
});
const JoiningProviderState = createContext<State>({} as State);

const JoiningProvider: React.FC = ({children}) => {
    const [state, dispatch] = useReducer<React.Reducer<State, Action>>(reducer, initialState);
    const {socket} = useMeetingProviderState();

    useEffect(() => {
        const unbind = bindSocketEvents(socket, dispatch);
        return () => {
            unbind();
        };
    }, [socket]);

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
