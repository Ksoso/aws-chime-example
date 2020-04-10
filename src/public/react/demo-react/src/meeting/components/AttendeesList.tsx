import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import {createStyles, Paper, Theme, List, ListItem, ListItemText, ListItemIcon } from '@material-ui/core';
import {PhoneInTalk as CurrentlyTalkingIcon, Call as MuteIcon } from '@material-ui/icons';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        paper: {
            border: `1px solid ${theme.palette.divider}`,
            width: '20vw',
            maxHeight: '30vh',
            overflow: 'auto'
        },
    }), {name: 'AttendeesList'}
);

interface Attendee {
    userName: string,
    isTalking?: boolean,
    isMuted?: boolean,
    isStreaming?: boolean,
}

interface AttendeesListProps {
    attendees: Attendee[]
}

const AttendeesList: React.FC<AttendeesListProps> = ({attendees = []}) => {

    const classes = useStyles();

    const attendeesListItems = attendees.map( (attendee, idx) => {
        return <ListItem key={idx}>
            <ListItemIcon>{attendee.isTalking ? <CurrentlyTalkingIcon /> : <MuteIcon />}</ListItemIcon>
            <ListItemText primary={attendee.userName}/>
        </ListItem>
    });

    return <Paper className={classes.paper}>
        <List>
            {attendeesListItems}
        </List>
    </Paper>;
};

export default AttendeesList;
