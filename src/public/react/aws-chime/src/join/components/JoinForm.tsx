import React from 'react';
import {Button, Divider, TextField, Typography} from '@material-ui/core';
import {socketEmit} from '../containers/JoiningProvider/socket/emitters';
import {useMeetingProviderState} from '../../shared';

const JoinForm = () => {

    const [formState, setFormState] = React.useState<{ userName: string, userNameError: string }>({
        userName: '',
        userNameError: ''
    });

    const {socket} = useMeetingProviderState();

    const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setFormState({
            ...formState,
            [e.target.name]: e.target.value
        });
    };

    const validateField = (name): boolean => {
        if (formState[name]) {
            setFormState({
                ...formState, [`${name}Error`]: ''
            });
            return true;
        } else {
            setFormState({
                ...formState, [`${name}Error`]: 'User name can not be empty'
            });
            return false;
        }
    };

    const handleOnBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        validateField(e.target.name);
    };

    const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        if (validateField('userName')) {
            socketEmit(socket).subscribe(formState);
        }
    };

    return <form id='join-meeting' noValidate autoComplete='off'>
        <Typography component='h1' variant='h4'>Join to the room</Typography>
        <Divider/>
        <TextField error={Boolean(formState['userNameError'])} label='Your name'
                   onBlur={handleOnBlur} value={formState['userName']}
                   onChange={handleOnChange}
                   name='userName' placeholder='Your name' fullWidth required
                   helperText={formState['userNameError'] ? formState['userNameError'] : 'You will be visible as this name during meeting'}/>
        <Divider/>
        <Button type='submit' onClick={handleSubmit} color='primary' variant='contained' fullWidth>
            Join
        </Button>
    </form>;
};

export default JoinForm;
