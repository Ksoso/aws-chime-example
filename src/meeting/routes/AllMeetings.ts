import {BaseRouteHandler} from '../../shared/BaseRouteHandler';
import * as express from 'express';
import {MeetingRepo} from '../repos/MeetingRepo';
import {Chime} from 'aws-sdk';

export class AllMeetings extends BaseRouteHandler {

    private meetingRepo: MeetingRepo;
    private chime: Chime;

    constructor(meetingRepo: MeetingRepo, chime: Chime) {
        super();
        this.meetingRepo = meetingRepo;
        this.chime = chime;
    }

    protected async executeImpl(req: express.Request, res: express.Response): Promise<void | any> {
        const meetings = (await this.chime.listMeetings().promise()).Meetings || [];
        for (const meeting of meetings) {
            if (meeting.MeetingId) {
                await this.chime.deleteMeeting({
                    MeetingId: meeting.MeetingId
                });
            }
        }

        return this.ok(res, meetings);
    }
}
