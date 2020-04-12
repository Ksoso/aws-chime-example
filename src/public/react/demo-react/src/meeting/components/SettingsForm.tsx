import React, {ChangeEvent, SetStateAction, useEffect} from 'react';
import {ConsoleLogger, DefaultDeviceController, DeviceChangeObserver} from 'amazon-chime-sdk-js';
import LogLevel from 'amazon-chime-sdk-js/build/logger/LogLevel';
import {Grid, MenuItem, TextField} from '@material-ui/core';
import MeetingManager from '../MeetingManager';

const deviceController = new DefaultDeviceController(new ConsoleLogger('SDK', LogLevel.INFO));

interface DeviceInfo {
    label: string;
    value: string;
    original: MediaDeviceInfo;
}

interface DeviceFormState {
    microphone: string;
    speakers: string;
    camera: string;
    videoQuality: string;
}

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

const mapToSelectOption = (mediaDeviceInfo: MediaDeviceInfo, idx: number): DeviceInfo => ({
    label: mediaDeviceInfo.label || `device ${idx + 1}`,
    value: mediaDeviceInfo.deviceId,
    original: mediaDeviceInfo
});

class DeviceChangeObserverImpl implements DeviceChangeObserver {

    constructor(readonly dispatchForAudioInput: React.Dispatch<SetStateAction<DeviceInfo[]>>,
                readonly dispatchForAudioOutput: React.Dispatch<SetStateAction<DeviceInfo[]>>,
                readonly dispatchForVideoInput: React.Dispatch<SetStateAction<DeviceInfo[]>>) {
    }

    audioInputsChanged(freshAudioInputDeviceList?: MediaDeviceInfo[]): void {
        this.dispatchForAudioInput(freshAudioInputDeviceList ?
            freshAudioInputDeviceList.map(mapToSelectOption) : []);
    }

    audioOutputsChanged(freshAudioOutputDeviceList?: MediaDeviceInfo[]): void {
        this.dispatchForAudioOutput(freshAudioOutputDeviceList ?
            freshAudioOutputDeviceList.map(mapToSelectOption) : []);
    }

    videoInputsChanged(freshVideoInputDeviceList?: MediaDeviceInfo[]): void {
        this.dispatchForVideoInput(freshVideoInputDeviceList ?
            freshVideoInputDeviceList.map(mapToSelectOption) : []);
    }

}

const SettingsForm: React.FC = () => {

    const previewVideoRef = React.useRef<HTMLVideoElement>(null);
    const [audioInputs, setAudioInputs] = React.useState<DeviceInfo[]>([]);
    const [audioOutputs, setAudioOutputs] = React.useState<DeviceInfo[]>([]);
    const [videoInputs, setVideoInputs] = React.useState<DeviceInfo[]>([]);

    const [formState, setFormState] = React.useState<DeviceFormState>({
        microphone: '', speakers: '', camera: '', videoQuality: '540p'
    });

    useEffect(() => {
        (async () => {
            const [audioInputsP, audioOutputsP, videoInputsP] = await Promise.all<MediaDeviceInfo[], MediaDeviceInfo[], MediaDeviceInfo[]>([
                deviceController.listAudioInputDevices(),
                deviceController.listAudioOutputDevices(),
                deviceController.listVideoInputDevices()
            ]);

            setAudioInputs(audioInputsP.map(mapToSelectOption));
            setAudioOutputs(audioOutputsP.map(mapToSelectOption));
            setVideoInputs(videoInputsP.map(mapToSelectOption));
        })();
    }, []);

    useEffect(() => {
        const deviceChangeObserver = new DeviceChangeObserverImpl(setAudioInputs, setAudioOutputs, setVideoInputs);
        MeetingManager.addDeviceChangeObserver(deviceChangeObserver);

        return () => {
            MeetingManager.removeDeviceChangeObserver(deviceChangeObserver);
        };
    }, []);

    useEffect(() => {
        const deviceId = audioInputs.length ? audioInputs[0].value : '';
        setFormState(state => ({...state, 'microphone': deviceId}));
        (async () => {
            if (deviceId) {
                await MeetingManager.setDevice(audioInputs[0].original);
            }
        })();
    }, [audioInputs]);

    useEffect(() => {
        const deviceId = audioOutputs.length ? audioOutputs[0].value : '';
        setFormState(state => ({...state, 'speakers': deviceId}));
        (async () => {
            if (deviceId) {
                await MeetingManager.setDevice(audioOutputs[0].original);
            }
        })();
    }, [audioOutputs]);

    useEffect(() => {
        const deviceId = videoInputs.length ? videoInputs[0].value : '';
        setFormState(state => ({...state, 'camera': deviceId}));
        (async () => {
            if (deviceId) {
                await MeetingManager.setDevice(videoInputs[0].original);
                if (previewVideoRef.current) {
                    await MeetingManager.startPreviewVideo(previewVideoRef.current);
                }
            }
        })();
    }, [videoInputs]);

    const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const deviceType = e.target.name;
        const deviceId = e.target.value;
        setFormState({
            ...formState, [deviceType]: deviceId
        });
        if ('videoQuality' !== deviceType) {
            const device = [...videoInputs, ...audioInputs, ...audioOutputs].find(d => d.value === deviceId);
            if (device) {
                await MeetingManager.setDevice(device.original);
                if ('videoinput' === device.original.kind && previewVideoRef.current) {
                    await MeetingManager.startPreviewVideo(previewVideoRef.current);
                }
            }
        }
    };

    return <Grid container>
        <Grid item xs={6}>
            <video style={{height: '400px', width: '100%'}} ref={previewVideoRef}/>
        </Grid>
        <Grid item xs={6}>
            <form id='form-devices'>
                <TextField select label='Select audio input' name='microphone'
                           value={formState.microphone}
                           onChange={handleChange} fullWidth>
                    {
                        audioInputs.map(({label, value}) => {
                            return <MenuItem key={value} value={value}>
                                {label}
                            </MenuItem>;
                        })
                    }
                </TextField>
                <TextField select label='Select audio output' name='speakers'
                           value={formState.speakers}
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
        </Grid>
    </Grid>;
};

export default SettingsForm;
