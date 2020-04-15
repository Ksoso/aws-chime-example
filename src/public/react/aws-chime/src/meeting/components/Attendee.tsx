import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import {createStyles, ListItem, ListItemIcon, ListItemText, Theme} from '@material-ui/core';
import {Call as MuteIcon, PhoneInTalk as CurrentlyTalkingIcon} from '@material-ui/icons';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        activeSpeaker: {
            border: `1px solid ${theme.palette.secondary.main}`,
        },
    }), {name: 'Attendee'}
);

interface AttendeeProps {
    userName: string,
    isTalking?: boolean,
    isMuted?: boolean,
}

const Attendee: React.FC<AttendeeProps> = ({userName, isTalking = false, isMuted = false}) => {

    const classes = useStyles();

    return <ListItem className={isTalking ? classes.activeSpeaker : ''}>
        <ListItemIcon>{isMuted ? <MuteIcon/> : <CurrentlyTalkingIcon/>}</ListItemIcon>
        <ListItemText primary={userName} secondary={isTalking ? 'Active speaker' : ''}/>
    </ListItem>;
};

export default React.memo<AttendeeProps>(Attendee);
