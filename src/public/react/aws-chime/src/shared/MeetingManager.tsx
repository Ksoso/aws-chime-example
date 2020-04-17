import {
    AudioVideoFacade,
    AudioVideoObserver,
    ConsoleLogger,
    DefaultActiveSpeakerPolicy,
    DefaultDeviceController,
    DefaultMeetingSession,
    DeviceChangeObserver,
    LogLevel,
    MeetingSessionConfiguration
} from 'amazon-chime-sdk-js';

class MeetingManager {
    private meetingSession?: DefaultMeetingSession;
    private audioVideo?: AudioVideoFacade;
    private title?: string;
    private currentDevices: {
        audioInput: MediaDeviceInfo | null,
        audioOutput: MediaDeviceInfo | null,
        videoInput: MediaDeviceInfo | null
    } = {
        audioInput: null,
        audioOutput: null,
        videoInput: null,
    };

    async initializeMeetingSession(configuration: MeetingSessionConfiguration): Promise<any> {
        const logger = new ConsoleLogger('DEV-SDK', LogLevel.ERROR);
        const deviceController = new DefaultDeviceController(logger);
        configuration.enableWebAudio = false;
        this.meetingSession = new DefaultMeetingSession(configuration, logger, deviceController);
        this.audioVideo = this.meetingSession.audioVideo;
    }

    private cleanUp() {
        this.meetingSession = undefined;
        this.audioVideo = undefined;
        this.title = undefined;
        this.currentDevices = {
            audioOutput: null, videoInput: null, audioInput: null
        };
    }

    setDeviceLabelTrigger(labelTrigger: () => Promise<MediaStream>) {
        this.audioVideo?.setDeviceLabelTrigger(labelTrigger);
    }

    meetingInProgress() {
        return Boolean(this.title);
    }

    subscribeToAttendeeIdPresence(subscriber: (attendeeId: string, present: boolean) => void) {
        this.audioVideo?.realtimeSubscribeToAttendeeIdPresence(subscriber);
    }

    unsubscribeToAttendeeIdPresence(subscriber: (attendeeId: string, present: boolean) => void) {
        this.audioVideo?.realtimeUnsubscribeToAttendeeIdPresence(subscriber);
    }

    subscribeToAttendeeVolumeIndicator(attendeeId: string, subscriber: (attendeeId: string,
                                                                        volume: number | null,
                                                                        muted: boolean | null,
                                                                        signalStrength: number | null) => void) {
        this.audioVideo?.realtimeSubscribeToVolumeIndicator(attendeeId, subscriber);
    }

    unsubscribeFromAttendeeVolumeIndicator(attendeeId: string) {
        this.audioVideo?.realtimeUnsubscribeFromVolumeIndicator(attendeeId);
    }

    subscribeToActiveSpeakerDetector(subscriber: (attendeeIds: string[]) => void,
                                     scoresCallback?: (scores: { [attendeeId: string]: number }) => void,
                                     scoresCallbackIntervalMs?: number) {
        this.audioVideo?.subscribeToActiveSpeakerDetector(
            new DefaultActiveSpeakerPolicy(),
            subscriber, scoresCallback, scoresCallbackIntervalMs
        );
    }

    unsubscribeFromActiveSpeakerDetector(subscriber: (attendeeIds: string[]) => void) {
        this.audioVideo?.unsubscribeFromActiveSpeakerDetector(subscriber);
    }

    addAudioVideoObserver(observer: AudioVideoObserver): void {
        if (!this.audioVideo) {
            console.error('AudioVideo not initialized. Cannot add observer');
            return;
        }
        this.audioVideo.addObserver(observer);
    }

    removeMediaObserver(observer: AudioVideoObserver): void {
        if (!this.audioVideo) {
            console.error('AudioVideo not initialized. Cannot remove observer');
            return;
        }

        this.audioVideo.removeObserver(observer);
    }

    addDeviceChangeObserver(observer: DeviceChangeObserver): void {
        if (!this.audioVideo) {
            console.error('AudioVideo not initialized. Cannot add observer');
            return;
        }
        this.audioVideo.addDeviceChangeObserver(observer);
    }

    removeDeviceChangeObserver(observer: DeviceChangeObserver): void {
        if (!this.audioVideo) {
            console.error('AudioVideo not initialized. Cannot remove observer');
            return;
        }

        this.audioVideo.removeDeviceChangeObserver(observer);
    }

    bindVideoTile = (id: number, videoEl: HTMLVideoElement): void => {
        this.audioVideo?.bindVideoElement(id, videoEl);
    };

    async startLocalVideo(): Promise<void> {
        if (this.audioVideo) {
            if (this.currentDevices.videoInput == null) {
                const videoInput = await this.audioVideo.listVideoInputDevices();
                const defaultVideo = videoInput[0];
                await this.audioVideo.chooseVideoInputDevice(defaultVideo);
            } else {
                await this.audioVideo.chooseVideoInputDevice(this.currentDevices.videoInput);
            }
            this.audioVideo.startLocalVideoTile();
        }
    }

    stopLocalVideo(): void {
        this.audioVideo?.stopLocalVideoTile();
    }

    public async startMeeting(): Promise<boolean> {
        if (this.title) {
            const joinResponse = await fetch(`/meetings/exist/${encodeURIComponent(this.title)}`, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: 'GET',
            });

            const json = await joinResponse.json();
            const data = await json;

            if (data.exist) {
                this.audioVideo?.start();
                return true;
            }
        }
        return false;
    }

    async joinMeeting(meetingId: string, userUuid: string): Promise<any> {
        const joinResponse = await fetch('/meetings/join', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({
                meetingId, userUuid
            })
        });

        const json = await joinResponse.json();
        const data = await json;

        this.title = data.meetingId;
        await this.initializeMeetingSession(new MeetingSessionConfiguration(data.meeting, data.attendee));
        return this.title;
    }

    async endMeeting(): Promise<any> {

        if (this.title) {
            try {
                await fetch(`/meetings/${encodeURIComponent(this.title)}`, {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    method: 'DELETE',
                });
            } catch (e) {
                console.error(e.message);
            }
        }

        this.leaveMeeting();
        this.cleanUp();
    }

    leaveMeeting(): void {
        this.audioVideo?.stop();
    }

    async getAttendee(attendeeId: string): Promise<string | null> {
        const response = await fetch(
            `/users/attendees/${encodeURIComponent(attendeeId)}`, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: 'GET'
            }
        );
        if (response.ok) {
            const json = await response.json();
            return json.userName;
        }
        return null;
    }

    startPreviewVideo(ref: HTMLVideoElement) {
        this.audioVideo?.startVideoPreviewForVideoInput(ref);
    }

    async stopPreviewVideo(ref: HTMLVideoElement) {
        this.audioVideo?.stopVideoPreviewForVideoInput(ref);
        this.audioVideo?.chooseVideoInputDevice(null);
    }

    bindAudioElement(ref: HTMLAudioElement) {
        this.audioVideo?.bindAudioElement(ref);
    }

    unbindAudioElement(): void {
        this.audioVideo?.unbindAudioElement();
    }

    muteLocalAudio(): void {
        this.audioVideo?.realtimeMuteLocalAudio();
    }

    unmuteLocalAudio(): void {
        this.audioVideo?.realtimeUnmuteLocalAudio();
    }

    async setDefaultAudioInput(): Promise<void> {
        await this.audioVideo?.chooseAudioInputDevice(null);
    }

    async setDefaultAudioOutput(): Promise<void> {
        await this.audioVideo?.chooseAudioOutputDevice(null);
    }

    async setDevice(device: MediaDeviceInfo): Promise<void> {
        if (this.audioVideo) {
            switch (device.kind) {
                case 'audioinput':
                    this.currentDevices.audioInput = device;
                    await this.audioVideo.chooseAudioInputDevice(device.deviceId);
                    break;
                case 'audiooutput':
                    this.currentDevices.audioOutput = device;
                    await this.audioVideo.chooseAudioOutputDevice(device.deviceId);
                    break;
                case 'videoinput':
                    this.currentDevices.videoInput = device;
                    await this.audioVideo.chooseVideoInputDevice(device);
                    break;
                default:
                    break;
            }
        }
    }
}

export default MeetingManager;
