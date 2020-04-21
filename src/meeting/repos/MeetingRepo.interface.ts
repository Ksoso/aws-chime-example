import {Meeting} from 'aws-sdk/clients/chime';

export interface MeetingRepo {
    /**
     * Add new meeting to cache
     *
     * @param {string} meetingId as uuid version 4
     * @param {Meeting} meeting
     */
    saveMeeting(meetingId: string, meeting: Meeting): Meeting;

    /**
     * Remove meeting from cache
     *
     * @param {string} meetingId
     */
    deleteMeeting(meetingId: string): Meeting | undefined;

    /**
     * Check if meeting exists
     *
     * @param {string} meetingId
     */
    exist(meetingId: string): boolean;

    /**
     * Retrieve meeting
     *
     * @param {string} meetingId
     */
    get(meetingId: string): Meeting
}
