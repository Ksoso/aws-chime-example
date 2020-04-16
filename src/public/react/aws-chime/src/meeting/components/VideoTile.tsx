import React, {useEffect, useRef} from 'react';
import {createStyles, makeStyles} from '@material-ui/core/styles';
import {Badge, Typography} from '@material-ui/core';

interface VideoTileProps {
    isLocal: boolean;
    tileId: number;
    nameplate: string;
    bindVideoTile: (tileId: number, videoRef: HTMLVideoElement) => void;
}

const useStyles = makeStyles(theme => createStyles({
    root: {
        height: '100%',
        width: '100%',
        position: 'relative',
    },
    video: {
        height: '100%',
        width: '100%',
    },
    nameplate: {
        position: 'absolute',
        right: '50%',
        paddingTop: '5px',
        zIndex: 10,
    }
}), {name: 'videoTile'});

const VideoTile: React.FC<VideoTileProps> = ({bindVideoTile, tileId, nameplate, isLocal = false}) => {
    const classes = useStyles();
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (!videoRef.current) {
            return;
        }
        bindVideoTile(tileId, videoRef.current);
    }, [videoRef, tileId, bindVideoTile]);

    return <div className={classes.root}>
        <div className={classes.nameplate}>
            <Badge variant={'dot'} color={'secondary'} component={'div'} invisible={!isLocal}>
                <Typography component={'h1'} variant={'h4'} color={'textSecondary'}
                            align={'center'}>{nameplate.toUpperCase()} </Typography>
            </Badge>
        </div>
        <video className={classes.video} ref={videoRef}/>
    </div>;
};

export default React.memo<VideoTileProps>(VideoTile);
