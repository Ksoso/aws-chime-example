import React from 'react';
import './MeetingRoom.css';
import {makeStyles} from '@material-ui/core/styles';
import Toolbar from '../components/Toolbar';
import SettingsDialog from '../components/SettingsDialog';
import AttendeesList from '../components/AttendeesList';

const useStyles = makeStyles({
    root: {
        height: '100%',
        width: '100%',
    },
    toolbar: {
        position: 'absolute',
        top: '90vh',
        left: '42vw',
    },
    roster: {
        position: 'absolute',
        top: '25px',
        left: '25px',
    }
}, {name: 'MeetingRoom'});

const MeetingRoom = () => {
    const classes = useStyles();

    const [settingsDialogOpen, setSettingsDialogOpen] = React.useState(false);

    const handleToolbarClick = (prevActiveButtons: string[], newActiveButtons: string[]) => {
        const newActivatedButton = newActiveButtons.filter(btn => !prevActiveButtons.includes(btn)).pop();
        const newDeactivatedButton = prevActiveButtons.filter(btn => !newActiveButtons.includes(btn)).pop();
        if ('settings' === newActivatedButton) {
            setSettingsDialogOpen(true);
        }
        console.log('newActiveBtns', newActivatedButton);
        console.log('newdDeactivBtns', newDeactivatedButton);
    };

    return <div className={classes.root}>
        <div className={classes.roster}>
            <AttendeesList attendees={[
                {
                    userName: 'Test user 1',
                    isTalking: true
                },
                {
                    userName: 'Test user 2',
                    isTalking: false
                },
            ]}/>
        </div>
        <div className={classes.toolbar}>
            <Toolbar onToolbarClick={handleToolbarClick}/>
        </div>
        <SettingsDialog open={settingsDialogOpen} onClose={() => {
            setSettingsDialogOpen(false);
        }}/>
    </div>;
};

export default MeetingRoom;
