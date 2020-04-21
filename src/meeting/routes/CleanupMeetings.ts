import {BaseRouteHandler} from '../../shared/BaseRouteHandler';
import * as express from 'express';
import {MeetingRepoImpl} from '../repos/MeetingRepoImpl';
import {Chime} from 'aws-sdk';
import {MeetingRepo} from '../repos/MeetingRepo.interface';

/**
 * This endpoint got one purpose: delete 100 of active meetings created by
 * user connected with aws sdk.
 *
 * For delete more than 100, pagination has to be handled
 *
 */
export class CleanupMeetings extends BaseRouteHandler {

    private meetingRepo: MeetingRepo;
    private chime: Chime;

    constructor(meetingRepo: MeetingRepoImpl, chime: Chime) {
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
