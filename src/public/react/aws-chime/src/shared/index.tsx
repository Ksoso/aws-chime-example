import React, {createContext, useEffect} from 'react';
import Socket from './Socket';
import MeetingManager from './MeetingManager';

interface MeetingProviderState {
    socket: Socket;
    meetingManager: MeetingManager;
}

const MeetingProviderContext = createContext<MeetingProviderState | null>(null);

const MeetingProvider: React.FC = ({children}) => {

    const [socket] = React.useState<Socket>(new Socket());
    const [meetingManager] = React.useState<MeetingManager>(new MeetingManager());
    const [wsConnected, setWsConnected] = React.useState(false);

    const meetingProviderState: MeetingProviderState = {
        socket, meetingManager
    };

    useEffect(() => {
        socket.connect('http://127.0.0.1:3001', connected => {
            console.log(`WS connection status: ${connected}, socket id ${socket.socketId}`);
            setWsConnected(true);
        });

        return () => {
            socket.disconnect();
        };
    }, [socket]);

    return <MeetingProviderContext.Provider value={meetingProviderState}>
        {wsConnected ? children : null}
    </MeetingProviderContext.Provider>;
};

export function useMeetingProviderState(): MeetingProviderState {
    const contextState = React.useContext(MeetingProviderContext);
    if (contextState == null) {
        throw new Error('Meeting context can not be null');
    }
    return contextState;
}

export default MeetingProvider;
