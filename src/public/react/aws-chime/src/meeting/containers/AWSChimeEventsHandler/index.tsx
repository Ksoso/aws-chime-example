import React, {createContext, useEffect} from 'react';
import {useMeetingProviderState} from '../../../shared';
import {MeetingSessionStatusCode, VideoTileState} from 'amazon-chime-sdk-js';
import AudioVideoObserverImpl from './AudioVideoObserverImpl';
import {Button, Dialog, DialogActions, DialogContent, DialogTitle} from '@material-ui/core';
import {useHistory} from 'react-router-dom';
import routes from '../../../routes';
import AttendeeEventsWatcher from './AttendeeEventsWatcher';

export interface VideoState {
    status: MeetingSessionStatusCode;
    tiles: {
        [key: number]: VideoTileState;
    }
}

export interface RosterAttendee {
    name: string;
    volume?: number;
    muted?: boolean;
    signalStrength?: number;
    active: boolean
}

export interface RosterState {
    [key: string]: RosterAttendee
}

export interface AWSChimeEventHandlersState {
    video: VideoState,
    roster: RosterState
}

const AWSChimeProviderProviderState = createContext<AWSChimeEventHandlersState | null>(null);

const AWSChimeEventsHandlerProvider: React.FC = ({children}) => {
    const history = useHistory();
    const {meetingManager} = useMeetingProviderState();
    const [video, setVideo] = React.useState<VideoState>({
        status: MeetingSessionStatusCode.OK,
        tiles: {}
    });

    const [roster, setRoster] = React.useState<RosterState>({});

    useEffect(() => {
        const audioVideoObserver = new AudioVideoObserverImpl(setVideo);
        if (meetingManager.meetingInProgress()) {
            meetingManager.addAudioVideoObserver(audioVideoObserver);
        }

        return () => {
            meetingManager.removeMediaObserver(audioVideoObserver);
        };
    }, [meetingManager]);

    useEffect(() => {
        const realtimeAttendeeWatcher = new AttendeeEventsWatcher(setRoster, meetingManager);
        realtimeAttendeeWatcher.watch();

        return () => {
            realtimeAttendeeWatcher.unWatch();
        };
    }, [meetingManager]);

    useEffect(() => {
        meetingManager.setDeviceLabelTrigger(async (): Promise<MediaStream> => {
            return await navigator.mediaDevices.getUserMedia({audio: true, video: true});
        });
    }, [meetingManager]);

    const openDialog = video.status === MeetingSessionStatusCode.AudioCallEnded;

    const awsState: AWSChimeEventHandlersState = {video, roster};
    return <AWSChimeProviderProviderState.Provider value={awsState}>
        {children}
        <Dialog open={openDialog} disableBackdropClick>
            <DialogTitle>Call ended</DialogTitle>
            <DialogContent>Call ended or other user left. After clicking 'OK' you will return to
                Joining Room</DialogContent>
            <DialogActions>
                <Button fullWidth variant={'contained'} color={'primary'}
                        onClick={() => history.push(routes.ROOT)}>Ok</Button>
            </DialogActions>
        </Dialog>
    </AWSChimeProviderProviderState.Provider>;
};

export function useAWSChimeEventHandlersState(): AWSChimeEventHandlersState {
    const context = React.useContext(AWSChimeProviderProviderState);
    if (!context) {
        throw new Error('AWSChimeEventHandlersState can not be empty');
    }

    return context;
}

export default AWSChimeEventsHandlerProvider;
