import {Meeting} from 'aws-sdk/clients/chime';

interface MeetingsCache {
    [key: string]: Meeting
}

export class MeetingRepo {

    private meetingsCache: MeetingsCache = {};

    public saveMeeting(meetingId: string, meeting: Meeting): Meeting {
        this.meetingsCache[meetingId] = meeting;
        return meeting;
    }

    public deleteMeeting(meetingId: string): Meeting | undefined {
        const meeting: Meeting = this.meetingsCache[meetingId];
        if (meeting) {
            delete this.meetingsCache[meetingId];
        }
        return meeting;
    }

    public hasMeeting(meetingId: string): boolean {
        return Boolean(this.meetingsCache[meetingId]);
    }

    get(meetingId: string): Meeting {
        return this.meetingsCache[meetingId];
    }
}
