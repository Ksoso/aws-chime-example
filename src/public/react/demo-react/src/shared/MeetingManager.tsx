import {
    AudioVideoFacade,
    AudioVideoObserver,
    ConsoleLogger,
    DefaultDeviceController,
    DefaultMeetingSession,
    DeviceChangeObserver,
    LogLevel,
    MeetingSessionConfiguration
} from 'amazon-chime-sdk-js';

export interface ClientConfiguration {
    audioInputId: string,
    audioOutputId: string,
    videoInputId: string
}

class MeetingManager {
    private meetingSession?: DefaultMeetingSession;
    private audioVideo?: AudioVideoFacade;
    private title?: string;

    async initializeMeetingSession(configuration: MeetingSessionConfiguration): Promise<any> {
        const logger = new ConsoleLogger('DEV-SDK', LogLevel.INFO);
        const deviceController = new DefaultDeviceController(logger);
        configuration.enableWebAudio = false;
        this.meetingSession = new DefaultMeetingSession(configuration, logger, deviceController);
        this.audioVideo = this.meetingSession.audioVideo;
    }

    private cleanUp() {
        this.meetingSession = undefined;
        this.audioVideo = undefined;
        this.title = undefined;

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

    bindVideoTile(id: number, videoEl: HTMLVideoElement): void {
        this.audioVideo?.bindVideoElement(id, videoEl);
    }

    async startLocalVideo(): Promise<void> {
        if (this.audioVideo) {
            const videoInput = await this.audioVideo.listVideoInputDevices();
            const defaultVideo = videoInput[0];
            await this.audioVideo.chooseVideoInputDevice(defaultVideo);
            this.audioVideo.startLocalVideoTile();
        }
    }

    stopLocalVideo(): void {
        this.audioVideo?.stopLocalVideoTile();
    }

    public startMeeting() {
        this.audioVideo?.start();
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

        console.log('###############ENDING MEETING######################');
        if (this.title) {
            await fetch(`/meetings/${encodeURIComponent(this.title)}`, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: 'DELETE',
            });
        }

        this.leaveMeeting();
        this.cleanUp();
    }

    leaveMeeting(): void {
        this.audioVideo?.stop();
    }

    // async getAttendee(attendeeId: string): Promise<string> {
    //     const response = await fetch(
    //         `${BASE_URL}attendee?title=${encodeURIComponent(this.title)}&attendee=${encodeURIComponent(
    //             attendeeId
    //         )}`
    //     );
    //     const json = await response.json();
    //     return json.AttendeeInfo.Name;
    // }

    startPreviewVideo(ref: HTMLVideoElement) {
        this.audioVideo?.startVideoPreviewForVideoInput(ref);
    }

    stopPreviewVideo(ref: HTMLVideoElement) {
        this.audioVideo?.stopVideoPreviewForVideoInput(ref);
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

    async setDevice(device: MediaDeviceInfo): Promise<void> {
        if (this.audioVideo) {
            switch (device.kind) {
                case 'audioinput':
                    await this.audioVideo.chooseAudioInputDevice(device.deviceId);
                    break;
                case 'audiooutput':
                    await this.audioVideo.chooseAudioOutputDevice(device.deviceId);
                    break;
                case 'videoinput':
                    await this.audioVideo.chooseVideoInputDevice(device);
                    break;
                default:
                    break;
            }
        }
    }
}

export default MeetingManager;
