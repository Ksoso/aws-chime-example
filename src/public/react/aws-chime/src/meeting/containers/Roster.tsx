import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import {createStyles, List, Paper, Theme} from '@material-ui/core';
import {useAWSChimeEventHandlersState} from './AWSChimeEventsHandler';
import Attendee from '../components/Attendee';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        paper: {
            border: `1px solid ${theme.palette.divider}`,
            width: '15vw',
            maxHeight: '30vh',
            overflow: 'auto'
        },
    }), {name: 'Roster'}
);

const Roster: React.FC = () => {

    const classes = useStyles();
    const {roster} = useAWSChimeEventHandlersState();

    const attendees = Object.entries(roster)
        .map(([key, attendee]) => <Attendee key={key} isMuted={attendee.muted}
                                            userName={attendee.name}
                                            isTalking={attendee.active}/>);

    return Boolean(Object.values(roster).length) ? <Paper className={classes.paper}>
        <List>
            {attendees}
        </List>
    </Paper> : null;
};

export default Roster;
