import React, {ChangeEvent, MouseEvent, useEffect} from 'react';
import {Button, Divider, MenuItem, TextField, Typography} from '@material-ui/core';
import {ConsoleLogger, DefaultDeviceController} from 'amazon-chime-sdk-js';
import LogLevel from 'amazon-chime-sdk-js/build/logger/LogLevel';
import MeetingManager from '../meeting/MeetingManager';
import {v4 as uuidV4} from 'uuid';
import Socket, {EVENTS} from '../Socket';

const videoQuality = [
    {
        value: '360p',
        label: '360p (nHD) @ 15 fps (600 Kbps max)'
    },
    {
        value: '540p',
        label: '540p (qHD) @ 15 fps (1.4 Mbps max)'
    },
    {
        value: '720p',
        label: '720p (HD) @ 15 fps (1.4 Mbps max)'
    }
];

const deviceController = new DefaultDeviceController(new ConsoleLogger('SDK', LogLevel.INFO));

interface DeviceInfo {
    label: string,
    value: string
}

interface DeviceFormState {
    microphone: string,
    speakers: string,
    camera: string,
    videoQuality: string
}

const DeviceManagementForm: React.FC<{ onCallStart: Function, currentUser: { uuid: string } | null, selectedUser: string | null, meetingId: string | null }>
    = ({onCallStart, currentUser, selectedUser, meetingId}) => {

    const [audioInputs, setAudioInputs] = React.useState<DeviceInfo[]>([]);
    const [audioOutputs, setAudioOutputs] = React.useState<DeviceInfo[]>([]);
    const [videoInputs, setVideoInputs] = React.useState<DeviceInfo[]>([]);

    const [formState, setFormState] = React.useState<DeviceFormState>({
        microphone: '', speakers: '', camera: '', videoQuality: '540p'
    });

    useEffect(() => {
        const mapToSelectOption = (mediaDeviceInfo: MediaDeviceInfo, idx: number): DeviceInfo => {
            return {
                label: mediaDeviceInfo.label || `device ${idx + 1}`,
                value: mediaDeviceInfo.deviceId
            };
        };

        (async function loadMediaDevices() {
            const audioInputs = (await deviceController.listAudioInputDevices()).map(mapToSelectOption);
            const audioOutputs = (await deviceController.listAudioOutputDevices()).map(mapToSelectOption);
            const videoInputs = (await deviceController.listVideoInputDevices()).map(mapToSelectOption);

            setAudioInputs(audioInputs);
            setAudioOutputs(audioOutputs);
            setVideoInputs(videoInputs);
        })();
    }, []);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFormState({
            ...formState, [e.target.name]: e.target.value
        });
    };

    const handleStartVideoConference = async (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (currentUser) {
            const meetingIdResponse = await MeetingManager.joinMeeting(meetingId ? meetingId : uuidV4(), currentUser.uuid, {
                audioInputId: formState.microphone,
                audioOutputId: formState.speakers,
                videoInputId: formState.camera
            });
            onCallStart();
            if(selectedUser) {
                Socket.emit(EVENTS.CALL_TO_USER, {
                    recipient: selectedUser,
                    meetingId: meetingIdResponse,
                    sender: currentUser.uuid
                });
            }
            console.log('creating/joining meeting');
        }
    };

    return <form id='form-devices'>
        <Typography variant='h1'>
            Select devices
        </Typography>
        <Divider/>
        <TextField select label='Microphone' name='microphone' value={formState.microphone}
                   onChange={handleChange} fullWidth>
            {
                audioInputs.map(({label, value}) => {
                    return <MenuItem key={value} value={value}>
                        {label}
                    </MenuItem>;
                })
            }
        </TextField>
        <TextField select label='Camera' name='camera' value={formState.camera} onChange={handleChange} fullWidth>
            {
                videoInputs.map(({label, value}) => {
                    return <MenuItem key={value} value={value}>
                        {label}
                    </MenuItem>;
                })
            }
        </TextField>
        <TextField select label='Video quality' name='videoQuality' value={formState.videoQuality}
                   onChange={handleChange} fullWidth>
            {
                videoQuality.map(({label, value}) => {
                    return <MenuItem key={value} value={value}>
                        {label}
                    </MenuItem>;
                })
            }
        </TextField>
        <TextField select label='Speakers' name='speakers' value={formState.speakers}
                   onChange={handleChange} fullWidth>
            {
                audioOutputs.map(({label, value}) => {
                    return <MenuItem key={value} value={value}>
                        {label}
                    </MenuItem>;
                })
            }
        </TextField>
        <Divider/>
        <Button type='submit' variant={'contained'} color={'primary'}
                onClick={handleStartVideoConference}>
            Start Video Conference
        </Button>
    </form>;
};

export default DeviceManagementForm;
