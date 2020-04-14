import React, {useEffect, useReducer} from 'react';
import VideoTile from '../components/VideoTile';
import {Grid} from '@material-ui/core';
import {useMeetingProviderState} from '../../shared';

enum ActionType {
    TileUpdated = 'TILE_UPDATED',
    TileDeleted = 'TILE_DELETED'
}

interface Action {
    type: ActionType;
    payload?: any;
}

interface State {
    [key: string]: any
}

function reducer(state: State, {type, payload}: Action): State {
    switch (type) {
        case ActionType.TileUpdated: {
            const {tileId, ...rest} = payload;
            return {
                ...state,
                [tileId]: {
                    ...rest
                }
            };
        }
        case ActionType.TileDeleted: {
            const {[payload as string]: omit, ...rest} = state;
            return {
                ...rest
            };
        }
        default: {
            return state;
        }
    }
}

const VideoManager: React.FC = () => {
    const [state, dispatch] = useReducer(reducer, {});
    const {meetingManager} = useMeetingProviderState();

    const videoTileDidUpdate = (tileState: { isContent: boolean }) => {
        dispatch({type: ActionType.TileUpdated, payload: tileState});
    };

    const videoTileWasRemoved = (tileId: number) => {
        dispatch({type: ActionType.TileDeleted, payload: tileId});
    };

    useEffect(() => {
        const videoObservers = {videoTileDidUpdate, videoTileWasRemoved};

        meetingManager.addAudioVideoObserver(videoObservers);
        return () => {
            meetingManager.removeMediaObserver(videoObservers);
        };
    }, [meetingManager]);

    const videos = Object.keys(state).map((tileId, idx) => {
        return <Grid item sm={4} key={idx}>
            <VideoTile isLocal={state[tileId].localTile} nameplate={'Attendee Id'}
                       bindVideoTile={videoRef => meetingManager.bindVideoTile(parseInt(tileId), videoRef)}/>
        </Grid>;
    });

    return <Grid container spacing={2}>{videos}</Grid>;
};

export default VideoManager;
