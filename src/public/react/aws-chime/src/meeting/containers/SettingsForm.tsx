import React, {ChangeEvent, SetStateAction, useEffect} from 'react';
import {ConsoleLogger, DefaultDeviceController, DeviceChangeObserver} from 'amazon-chime-sdk-js';
import LogLevel from 'amazon-chime-sdk-js/build/logger/LogLevel';
import {Grid, MenuItem, TextField} from '@material-ui/core';
import {useMeetingProviderState} from '../../shared';

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
}

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

    const {meetingManager} = useMeetingProviderState();
    const previewVideoRef = React.useRef<HTMLVideoElement>(null);
    const [audioInputs, setAudioInputs] = React.useState<DeviceInfo[]>([]);
    const [audioOutputs, setAudioOutputs] = React.useState<DeviceInfo[]>([]);
    const [videoInputs, setVideoInputs] = React.useState<DeviceInfo[]>([]);

    const [formState, setFormState] = React.useState<DeviceFormState>({
        microphone: '', speakers: '', camera: ''
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
        meetingManager.addDeviceChangeObserver(deviceChangeObserver);

        return () => {
            meetingManager.removeDeviceChangeObserver(deviceChangeObserver);
        };
    }, [meetingManager]);

    useEffect(() => {
        const previewNode = previewVideoRef.current;

        return () => {
            if (previewNode) {
                meetingManager.stopPreviewVideo(previewNode);
            }
        };
    }, [meetingManager]);

    useEffect(() => {
        const deviceId = audioInputs.length ? audioInputs[0].value : '';
        setFormState(state => ({...state, 'microphone': deviceId}));
        (async () => {
            if (deviceId) {
                await meetingManager.setDevice(audioInputs[0].original);
            }
        })();
    }, [audioInputs, meetingManager]);

    useEffect(() => {
        const deviceId = audioOutputs.length ? audioOutputs[0].value : '';
        setFormState(state => ({...state, 'speakers': deviceId}));
        (async () => {
            if (deviceId) {
                await meetingManager.setDevice(audioOutputs[0].original);
            }
        })();
    }, [audioOutputs, meetingManager]);

    useEffect(() => {
        const deviceId = videoInputs.length ? videoInputs[0].value : '';
        setFormState(state => ({...state, 'camera': deviceId}));
        (async () => {
            if (deviceId) {
                await meetingManager.setDevice(videoInputs[0].original);
                if (previewVideoRef.current) {
                    meetingManager.startPreviewVideo(previewVideoRef.current);
                }
            } else {
                if (previewVideoRef.current) {
                    meetingManager.stopPreviewVideo(previewVideoRef.current);
                }
            }
        })();
    }, [videoInputs, meetingManager]);

    const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const deviceType = e.target.name;
        const deviceId = e.target.value;
        setFormState((state) => ({
            ...state, [deviceType]: deviceId
        }));
        const device = [...videoInputs, ...audioInputs, ...audioOutputs].find(d => d.value === deviceId);
        if (device) {
            await meetingManager.setDevice(device.original);
            if ('videoinput' === device.original.kind && previewVideoRef.current) {
                meetingManager.startPreviewVideo(previewVideoRef.current);
            }
        }
    };

    return <Grid container spacing={2}>
        <Grid item xs={12}>
            <video style={{width: '100%'}} ref={previewVideoRef}/>
        </Grid>
        <Grid item xs={12}>
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
            </form>
        </Grid>
    </Grid>;
};

export default SettingsForm;
