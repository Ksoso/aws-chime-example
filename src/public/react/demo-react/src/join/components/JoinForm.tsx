import React from 'react';
import {Button, Divider, TextField, Typography} from '@material-ui/core';
import {SocketEmitters} from '../containers/JoiningProvider/socket/emitters';

// const awsLocales = [
//     {value: 'us-east-1', label: 'United States (N. Virginia)'},
//     {value: 'ap-northeast-1', label: 'Japan (Tokyo)'},
//     {value: 'ap-southeast-1', label: 'Singapore'},
//     {value: 'ap-southeast-2', label: 'Australia (Sydney)'},
//     {value: 'ca-central-1', label: 'Canada'},
//     {value: 'eu-central-1', label: 'Germany (Frankfurt)'},
//     {value: 'eu-north-1', label: 'Sweden (Stockholm)'},
//     {value: 'eu-west-1', label: 'Ireland'},
//     {value: 'eu-west-2', label: 'United Kingdom (London)'},
//     {value: 'eu-west-3', label: 'France (Paris)'},
//     {value: 'sa-east-1', label: 'Brazil (São Paulo)'},
//     {value: 'us-east-2', label: 'United States (Ohio)'},
//     {value: 'us-west-1', label: 'United States (N. California)'},
//     {value: 'us-west-2', label: 'United States (Oregon)'}
// ];

const JoinForm = () => {

    const [formState, setFormState] = React.useState({
        'userName': '',
    });

    const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setFormState({
            ...formState,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        SocketEmitters.subscribe(formState);
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
