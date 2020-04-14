import {BaseRouteHandler} from '../../shared/BaseRouteHandler';
import * as express from 'express';
import {MeetingRepo} from '../repos/MeetingRepo';
import {Chime} from 'aws-sdk';
import {NO_CONTENT} from 'http-status-codes';

export class DeleteMeeting extends BaseRouteHandler {

    private meetingRepo: MeetingRepo;
    private chime: Chime;

    constructor(meetingRepo: MeetingRepo, chime: Chime) {
        super();
        this.meetingRepo = meetingRepo;
        this.chime = chime;
    }

    protected async executeImpl(req: express.Request, res: express.Response): Promise<void | any> {
        const meetingId: string = req.params.meetingId;
        const meeting = this.meetingRepo.get(meetingId);
        if (meeting && meeting.MeetingId) {
            await this.chime.deleteMeeting({MeetingId: meeting.MeetingId}).promise();
            res.sendStatus(NO_CONTENT);
        } else {
            this.fail(res, `Meeting with meetingId: ${meetingId} not found`);
        }
    }

}
