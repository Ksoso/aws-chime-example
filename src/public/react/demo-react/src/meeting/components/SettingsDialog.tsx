import React, {ChangeEvent, useEffect} from 'react';
import {ConsoleLogger, DefaultDeviceController} from 'amazon-chime-sdk-js';
import LogLevel from 'amazon-chime-sdk-js/build/logger/LogLevel';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    TextField
} from '@material-ui/core';

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

const SettingsDialog: React.FC<{ open: boolean, onClose: () => void }> = ({open = false, onClose}) => {

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

    const handleCancel = () => {
        onClose();
    };

    const handleSave = () => {
        onClose();
    };

    return <Dialog open={open} onClose={onClose}>
        <DialogTitle>Settings</DialogTitle>
        <DialogContent>
            <form id='form-devices'>
                <TextField select label='Select audio input' name='microphone' value={formState.microphone}
                           onChange={handleChange} fullWidth>
                    {
                        audioInputs.map(({label, value}) => {
                            return <MenuItem key={value} value={value}>
                                {label}
                            </MenuItem>;
                        })
                    }
                </TextField>
                <TextField select label='Select audio output' name='speakers' value={formState.speakers}
                           onChange={handleChange} fullWidth>
                    {
                        audioOutputs.map(({label, value}) => {
                            return <MenuItem key={value} value={value}>
                                {label}
                            </MenuItem>;
                        })
                    }
                </TextField>
                <TextField select label='Select video input' name='camera' value={formState.camera}
                           onChange={handleChange} fullWidth>
                    {
                        videoInputs.map(({label, value}) => {
                            return <MenuItem key={value} value={value}>
                                {label}
                            </MenuItem>;
                        })
                    }
                </TextField>
                <TextField select label='Select video quality' name='videoQuality'
                           value={formState.videoQuality}
                           onChange={handleChange} fullWidth>
                    {
                        videoQuality.map(({label, value}) => {
                            return <MenuItem key={value} value={value}>
                                {label}
                            </MenuItem>;
                        })
                    }
                </TextField>
            </form>
        </DialogContent>
        <DialogActions>
            <Button onClick={handleCancel} color="primary">
                Cancel
            </Button>
            <Button onClick={handleSave} color="primary">
                Save
            </Button>
        </DialogActions>
    </Dialog>;
};

export default SettingsDialog;
