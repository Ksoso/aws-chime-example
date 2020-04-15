import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import {createStyles, List, Paper, Theme} from '@material-ui/core';
import {useAWSChimeEventHandlersState} from './AWSChimeEventsHandler';
import Attendee from '../components/Attendee';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        paper: {
            border: `1px solid ${theme.palette.divider}`,
            width: '20vw',
            maxHeight: '30vh',
            overflow: 'auto'
        },
    }), {name: 'Roster'}
);

const Roster: React.FC = () => {

    const classes = useStyles();
    const {roster} = useAWSChimeEventHandlersState();

    const attendees = Object.entries(roster.attendees)
        .map(([key, attendee]) => <Attendee key={key} isMuted={attendee.muted}
                                            userName={attendee.name}
                                            isTalking={attendee.active}/>);

    return <Paper className={classes.paper}>
        <List>
            {attendees}
        </List>
    </Paper>;
};

export default Roster;
