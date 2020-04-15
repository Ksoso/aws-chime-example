import React from 'react';
import {Button, Divider, TextField, Typography} from '@material-ui/core';
import {socketEmit} from '../containers/JoiningProvider/socket/emitters';
import {useMeetingProviderState} from '../../shared';

const JoinForm = () => {

    const [formState, setFormState] = React.useState({
        'userName': '',
    });

    const {socket} = useMeetingProviderState();

    const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setFormState({
            ...formState,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        socketEmit(socket).subscribe(formState);
    };

    return <form id='join-meeting' noValidate autoComplete='off'>
        <Typography component='h1' variant='h4'>Join to the room</Typography>
        <Divider/>
        <TextField label='Your name' value={formState['userName']} onChange={handleOnChange}
                   name='userName' placeholder='Your name' fullWidth required
                   helperText='You will be visible as this name during meeting'/>
        <Divider/>
        <Button type='submit' onClick={handleSubmit} color='primary' variant='contained' fullWidth>
            Join
        </Button>
    </form>;
};

export default JoinForm;
