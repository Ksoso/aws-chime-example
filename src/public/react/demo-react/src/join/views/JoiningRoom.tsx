import React from 'react';
import {createStyles, makeStyles} from '@material-ui/core/styles';
import {Container, Grid} from '@material-ui/core';
import JoinForm from '../components/JoinForm';
import JoiningProvider from '../containers/JoiningProvider';
import UserCallList from '../containers/UserCallList';

const useStyles = makeStyles(theme => createStyles({
    root: {
        marginTop: theme.spacing(8),
    },
    leftBox: {
        borderRight: `1px solid ${theme.palette.divider}`
    },
    rightBox: {
        borderLeft: `1px solid ${theme.palette.divider}`
    }
}), {name: 'JoiningRoom'});

const JoiningRoom = () => {
    const classes = useStyles();

    return <JoiningProvider>
        <Container maxWidth={'md'} className={classes.root}>
            <Grid container spacing={4}>
                <Grid item xs={6} className={classes.leftBox}>
                    <JoinForm/>
                </Grid>
                <Grid item xs={6} className={classes.rightBox}>
                    <UserCallList/>
                </Grid>
            </Grid>
        </Container>
    </JoiningProvider>;
};

export default JoiningRoom;
