import React, {useEffect} from 'react';
import './MeetingRoom.css';
import {createStyles, makeStyles} from '@material-ui/core/styles';
import Toolbar from '../components/Toolbar';
import VideoManager from '../containers/VideoManager';
import {Box} from '@material-ui/core';
import {useHistory} from 'react-router-dom';
import routes from '../../routes';
import MeetingAudio from '../components/MeetingAudio';
import {useMeetingProviderState} from '../../shared';
import Roster from '../containers/Roster';

const useStyles = makeStyles(theme => createStyles({
    root: {
        height: '100%',
        width: '100%',
    },
    toolbar: {
        position: 'absolute',
        bottom: '5%',
        left: '42%',
        zIndex: 10,
    },
    videosContainer: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
    },
    videos: {
        backgroundColor: theme.palette.divider,
        width: '95%',
        height: '95%',
        padding: theme.spacing(1)
    },
    roster: {
        position: 'absolute',
        bottom: '5%',
        left: '4%',
        zIndex: 10,
    }
}), {name: 'MeetingRoom'});

const MeetingRoom = () => {
    const classes = useStyles();
    const history = useHistory();

    const {meetingManager} = useMeetingProviderState();
    const [isAudio, setIsAudio] = React.useState(true);

    useEffect(() => {
        (async () => {
            if (!await meetingManager.startMeeting()) {
                history.push(routes.ROOT);
            }
        })();
        return () => {
            meetingManager.leaveMeeting();
        };
    }, [meetingManager, history]);

    const handleToolbarClick = async (prevActiveButtons: string[], newActiveButtons: string[]) => {
        const newActivatedButton = newActiveButtons.filter(btn => !prevActiveButtons.includes(btn)).pop();
        const newDeactivatedButton = prevActiveButtons.filter(btn => !newActiveButtons.includes(btn)).pop();
        //Active buttons handler
        if ('endMeeting' === newActivatedButton) {
            history.push(routes.ROOT);
            // await meetingManager.endMeeting();
        } else if ('videoIn' === newActivatedButton) {
            await meetingManager.startLocalVideo();
        } else if ('leaveMeeting' === newActivatedButton) {
            meetingManager.leaveMeeting();
            history.push(routes.SETTINGS);
        } else if ('audioOut' === newActivatedButton) {
            setIsAudio(true);
        } else if ('audioIn' === newActivatedButton) {
            meetingManager.unmuteLocalAudio();
        }

        //Deactivated buttons handlers
        if ('videoIn' === newDeactivatedButton) {
            await meetingManager.stopLocalVideo();
        } else if ('audioOut' === newDeactivatedButton) {
            setIsAudio(false);
        } else if ('audioIn' === newDeactivatedButton) {
            meetingManager.muteLocalAudio();
        }

    };

    return <div className={classes.root}>
        <div className={classes.roster}>
            <Roster/>
        </div>
        <div className={classes.videosContainer}>
            <Box borderRadius={10} className={classes.videos}>
                <VideoManager/>
                {isAudio && <MeetingAudio meetingManager={meetingManager}/>}
            </Box>
        </div>
        <div className={classes.toolbar}>
            <Toolbar onToolbarClick={handleToolbarClick}/>
        </div>
    </div>;
};

export default MeetingRoom;
