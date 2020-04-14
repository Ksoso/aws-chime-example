import React from 'react';
import {Button, Container, Grid} from '@material-ui/core';
import SettingsForm from '../containers/SettingsForm';
import {useHistory} from 'react-router-dom';
import routes from '../../routes';
import {useMeetingProviderState} from '../../shared';

const Settings: React.FC = () => {

    const history = useHistory();
    const {meetingManager} = useMeetingProviderState();

    return <Container maxWidth={'md'}>
        <Grid container>
            <SettingsForm/>
            <Grid item xs={6}>
                <Button variant={'contained'} color={'secondary'} fullWidth onClick={async () => {
                    await meetingManager.endMeeting();
                    history.push(routes.ROOT);
                }}>Cancel meeting</Button>
            </Grid>
            <Grid item xs={6}>
                <Button variant={'contained'} color={'primary'} fullWidth onClick={() => {
                    history.push(routes.MEETING);
                }}>Join meeting</Button>
            </Grid>
        </Grid>
    </Container>;
};

export default Settings;
