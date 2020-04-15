import {Meeting} from 'aws-sdk/clients/chime';

export interface MeetingRepo {
    saveMeeting(meetingId: string, meeting: Meeting): Meeting;

    deleteMeeting(meetingId: string): Meeting | undefined;

    exist(meetingId: string): boolean;

    get(meetingId: string): Meeting
}
