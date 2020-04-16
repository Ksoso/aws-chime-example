import React from 'react';
import VideoTile from '../components/VideoTile';
import {createStyles, Grid, makeStyles} from '@material-ui/core';
import {useMeetingProviderState} from '../../shared';
import {useAWSChimeEventHandlersState} from './AWSChimeEventsHandler';
import classNames from 'classnames';

const useStyles = makeStyles(theme => createStyles({
    localVideoTile: {
        backgroundColor: '#bbd7f6',
        borderRadius: 5
    },
    videoTile: {
        backgroundColor: '#dff4f9',
        borderRadius: 5
    }
}));

const getNameplate = (roster, boundAttendeeId, tileNameplate): string => {
    let nameplate = '';
    if (boundAttendeeId && roster[boundAttendeeId]) {
        nameplate = roster[boundAttendeeId].name;
    } else if (tileNameplate) {
        nameplate = tileNameplate;
    }

    return nameplate;
};

const VideoManager: React.FC = () => {

    const classes = useStyles();
    const {meetingManager} = useMeetingProviderState();
    const {video: {tiles}, roster} = useAWSChimeEventHandlersState();

    const videos = Object.values(tiles)
        .map(({tileId, localTile, boundAttendeeId, nameplate}, idx) => {
            const tileNameplate = getNameplate(roster, boundAttendeeId, nameplate);

            return <Grid item sm={6} key={idx} className={classNames({
                [classes.localVideoTile]: localTile,
                [classes.videoTile]: !localTile
            })}>
                {tileId && <VideoTile isLocal={localTile} nameplate={tileNameplate} tileId={tileId}
                                      bindVideoTile={meetingManager.bindVideoTile}/>}
            </Grid>;
        });

    return <Grid container spacing={1} style={{height: '100%'}}>{videos}</Grid>;
};

export default VideoManager;
