import React from 'react';
import VideoTile from '../components/VideoTile';
import {Grid} from '@material-ui/core';
import {useMeetingProviderState} from '../../shared';
import {useAWSChimeEventHandlersState} from './AWSChimeEventsHandler';

const VideoManager: React.FC = () => {

    const {meetingManager} = useMeetingProviderState();
    const {video: {tiles}} = useAWSChimeEventHandlersState();

    const videos = Object.values(tiles)
        .map(({tileId, localTile}, idx) => {
            return <Grid item sm={4} key={idx}>
                {tileId && <VideoTile isLocal={localTile} nameplate={'Attendee Id'} tileId={tileId}
                                      bindVideoTile={meetingManager.bindVideoTile}/>}
            </Grid>;
        });

    return <Grid container spacing={2}>{videos}</Grid>;
};

export default VideoManager;
