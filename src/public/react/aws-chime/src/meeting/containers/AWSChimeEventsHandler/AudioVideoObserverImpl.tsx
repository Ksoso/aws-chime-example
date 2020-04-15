import {AudioVideoObserver, MeetingSessionStatus, VideoTileState} from 'amazon-chime-sdk-js';
import React, {SetStateAction} from 'react';
import {VideoState} from './index';

export default class AudioVideoObserverImpl implements AudioVideoObserver {

    constructor(readonly dispatch: React.Dispatch<SetStateAction<VideoState>>) {
    }

    audioVideoDidStart(): void {
        console.log('Audio video start');
    }

    audioVideoDidStop(sessionStatus: MeetingSessionStatus): void {
        this.dispatch((prevState) => ({
            ...prevState, status: sessionStatus.statusCode()
        }));
    }

    videoTileDidUpdate(tileState: VideoTileState): void {
        const {tileId} = tileState;
        if (tileId) {
            this.dispatch((prevState) => {
                const tiles = {...prevState.tiles, [tileId]: tileState};
                return {...prevState, tiles};
            });
        }
    }

    videoTileWasRemoved(tileId: number): void {
        this.dispatch(prevState => {
            const {[tileId]: omit, ...rest} = prevState.tiles;
            return {...prevState, tiles: {...rest}};
        });
    }
}
