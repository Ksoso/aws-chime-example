import React, {SetStateAction} from 'react';
import {RosterState} from './index';
import MeetingManager from '../../../shared/MeetingManager';

export default class AttendeeEventsWatcher {

    constructor(readonly dispatch: React.Dispatch<SetStateAction<RosterState>>, readonly meetingManager: MeetingManager) {
    }

    watch() {
        this.meetingManager.subscribeToAttendeeIdPresence((attendeeId: string, present: boolean) => {
            this.subscribeToAttendeeIdPresence(attendeeId, present);
        });
        this.meetingManager.subscribeToActiveSpeakerDetector((attendeeIds: string[]) => {
            this.subscribeToActiveSpeakerDetector(attendeeIds);
        }, () => this.scoresCallback(), 200);
    }

    private scoresCallback() {
        this.dispatch(prevState => {
            return {...prevState, version: ++prevState.version};
        });
    }

    private subscribeToActiveSpeakerDetector(attendeeIds: string[]) {
        this.dispatch(prevState => {

            const newAttendees = {...prevState.attendees};
            for (const attendeeId in newAttendees) {
                newAttendees[attendeeId] = {...newAttendees[attendeeId], active: false};
            }

            for (const attendeeId of attendeeIds) {
                if (newAttendees[attendeeId]) {
                    newAttendees[attendeeId].active = true;
                    break;
                }
            }

            return {...prevState, attendees: newAttendees};
        });
    }


    private subscribeToAttendeeIdPresence(attendeeId: string, present: boolean): void {
        const self = this;
        this.dispatch(prevState => {
            if (!present) {
                const {[attendeeId]: omit, ...rest} = prevState.attendees;
                return {...prevState, attendees: {...rest}};
            }
            self.meetingManager.subscribeToAttendeeVolumeIndicator(attendeeId,
                async (attendeeId: string, volume: number | null, muted: boolean | null, signalStrength: number | null) => {
                    await self.subscribeToVolumeIndicator(attendeeId, volume, muted, signalStrength);
                });
            return prevState;
        });
    }

    private async subscribeToVolumeIndicator(attendeeId: string, volume: number | null, muted: boolean | null, signalStrength: number | null) {
        this.dispatch(prevState => {
            const newAttendees = {...prevState.attendees};
            if (!newAttendees[attendeeId]) {
                newAttendees[attendeeId] = {name: attendeeId, active: false};
            }
            if (volume !== null) {
                newAttendees[attendeeId].volume = Math.round(volume * 100);
            }
            if (muted !== null) {
                newAttendees[attendeeId].muted = muted;
            }
            if (signalStrength !== null) {
                newAttendees[attendeeId].signalStrength = Math.round(signalStrength * 100);
            }

            return {...prevState, attendees: newAttendees};
        });
    }
}


