import React, {SetStateAction} from 'react';
import {RosterState} from './index';
import MeetingManager from '../../../shared/MeetingManager';

export default class AttendeeEventsWatcher {

    private attendeeId?: string;
    private attendeeIdToUsername: { [key: string]: string } = {};

    constructor(readonly dispatch: React.Dispatch<SetStateAction<RosterState>>, readonly meetingManager: MeetingManager) {
    }

    watch() {
        this.meetingManager.subscribeToAttendeeIdPresence(this.subscribeToAttendeeIdPresence);
        this.meetingManager.subscribeToActiveSpeakerDetector(this.subscribeToActiveSpeakerDetector);
    }

    unWatch() {
        this.meetingManager.unsubscribeToAttendeeIdPresence(this.subscribeToAttendeeIdPresence);
        this.meetingManager.unsubscribeFromActiveSpeakerDetector(this.subscribeToActiveSpeakerDetector);
        if (this.attendeeId) {
            this.meetingManager.unsubscribeFromAttendeeVolumeIndicator(this.attendeeId);
        }
    }

    private subscribeToActiveSpeakerDetector = (attendeeIds: string[]) => {
        this.dispatch(prevState => {

            const newAttendees = {...prevState};
            for (const attendeeId in newAttendees) {
                newAttendees[attendeeId] = {...newAttendees[attendeeId], active: false};
            }

            for (const attendeeId of attendeeIds) {
                if (newAttendees[attendeeId]) {
                    newAttendees[attendeeId].active = true;
                    break;
                }
            }

            return newAttendees;
        });
    };

    private subscribeToAttendeeIdPresence = async (attendeeId: string, present: boolean): Promise<void> => {
        this.attendeeId = attendeeId;
        const self = this;

        if (present && !this.attendeeIdToUsername[attendeeId]) {
            const userName = await this.meetingManager.getAttendee(attendeeId);
            if (userName) {
                this.attendeeIdToUsername[attendeeId] = userName;
            }
        }

        this.dispatch(prevState => {
            if (!present) {
                const {[attendeeId]: omit, ...rest} = prevState;
                return {...rest};
            }
            self.meetingManager.subscribeToAttendeeVolumeIndicator(attendeeId,
                async (attendeeId: string, volume: number | null, muted: boolean | null, signalStrength: number | null) => {
                    await self.subscribeToVolumeIndicator(attendeeId, volume, muted, signalStrength);
                });
            return prevState;
        });
    };

    private subscribeToVolumeIndicator = (attendeeId: string, volume: number | null, muted: boolean | null, signalStrength: number | null) => {
        this.dispatch(prevState => {
            const newAttendees = {...prevState};
            if (!newAttendees[attendeeId]) {
                newAttendees[attendeeId] = {
                    name: this.attendeeIdToUsername[attendeeId] ? this.attendeeIdToUsername[attendeeId] : attendeeId,
                    active: false
                };
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

            return newAttendees;
        });
    };
}


