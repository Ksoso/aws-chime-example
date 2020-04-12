import React from 'react';
import {Button, Container, Grid} from '@material-ui/core';
import SettingsForm from '../components/SettingsForm';
import MeetingManager from '../MeetingManager';

const Settings: React.FC = () => {
    return <Container maxWidth={'md'}>
        <Grid container>
            <SettingsForm/>
            <Grid item xs={6}>
                <Button onClick={async () => {
                    await MeetingManager.endMeeting();
                }}>Cancel meeting</Button>
            </Grid>
            <Grid item xs={6}>
                <Button>Join meeting</Button>
            </Grid>
        </Grid>
    </Container>;
};

export default Settings;
