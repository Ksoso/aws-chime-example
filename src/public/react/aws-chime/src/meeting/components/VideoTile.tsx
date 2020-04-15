import React, {useEffect, useRef} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import classNames from 'classnames';

interface VideoTileProps {
    isLocal: boolean;
    tileId: number;
    nameplate: string;
    bindVideoTile: (tileId: number, videoRef: HTMLVideoElement) => void;
}

const useStyles = makeStyles({
    root: {
        height: '400px',
        width: '100%'
    },
    local: {
        border: '2px solid red'
    }
}, {name: 'videoTile'});

const VideoTile: React.FC<VideoTileProps> = ({bindVideoTile, tileId, nameplate, isLocal = false}) => {
    const classes = useStyles();
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (!videoRef.current) {
            return;
        }
        bindVideoTile(tileId, videoRef.current);
    }, [videoRef, tileId, bindVideoTile]);

    return <video className={classNames(classes.root, {[classes.local]: isLocal})} ref={videoRef}/>;
};

export default React.memo<VideoTileProps>(VideoTile);
