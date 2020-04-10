import React, {useEffect, useReducer} from 'react';
import VideoTile from '../components/VideoTile';
import {Grid} from '@material-ui/core';
import MeetingManager from '../meeting/MeetingManager';

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

    const videoTileDidUpdate = (tileState: { isContent: boolean }) => {
        console.log('Update!!', tileState.isContent);
        dispatch({type: ActionType.TileUpdated, payload: tileState});
    };

    const videoTileWasRemoved = (tileId: number) => {
        dispatch({type: ActionType.TileDeleted, payload: tileId});
    };

    const videoObservers = {videoTileDidUpdate, videoTileWasRemoved};

    useEffect(() => {
        MeetingManager.addAudioVideoObserver(videoObservers);
        return () => {
            MeetingManager.removeMediaObserver(videoObservers);
        };
    }, []);

    const videos = Object.keys(state).map((tileId, idx) => {
        return <Grid item sm={4} key={idx}>
            <VideoTile isLocal={state[tileId].localTile} nameplate={'Attendee Id'}
                       bindVideoTile={videoRef => MeetingManager.bindVideoTile(parseInt(tileId), videoRef)}/>
        </Grid>;
    });

    console.log('videoManagerState', state);

    return <Grid container spacing={2}>{videos}</Grid>;
};

export default VideoManager;
