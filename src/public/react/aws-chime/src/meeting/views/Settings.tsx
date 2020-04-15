import React from 'react';
import {Box, Button, Container, createStyles, Grid, makeStyles} from '@material-ui/core';
import SettingsForm from '../containers/SettingsForm';
import {useHistory} from 'react-router-dom';
import routes from '../../routes';
import {useMeetingProviderState} from '../../shared';

const useStyles = makeStyles(theme => createStyles({
    root: {
        paddingTop: '10px'
    },
    boxContainer: {
        padding: theme.spacing(2),
        border: `1px solid ${theme.palette.divider}`
    }
}), {name: 'Settings'});

const Settings: React.FC = () => {

    const classes = useStyles();
    const history = useHistory();
    const {meetingManager} = useMeetingProviderState();

    return <Container maxWidth={'md'} className={classes.root}>
        <Box borderRadius={12} className={classes.boxContainer}>
            <Grid container spacing={2}>
                <SettingsForm/>
                <Grid item xs={6}>
                    <Button variant={'contained'} color={'secondary'} fullWidth
                            onClick={() => {
                                history.push(routes.ROOT);
                                meetingManager.endMeeting();
                            }}>Cancel call</Button>
                </Grid>
                <Grid item xs={6}>
                    <Button variant={'contained'} color={'primary'} fullWidth onClick={() => {
                        history.push(routes.MEETING);
                    }}>Join call</Button>
                </Grid>
            </Grid>
        </Box>
    </Container>;
};

export default Settings;
