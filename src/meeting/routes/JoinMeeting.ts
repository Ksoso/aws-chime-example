import {BaseRouteHandler} from '../../shared/BaseRouteHandler';
import * as express from 'express';
import {MeetingRepo} from '../repos/MeetingRepo';
import {Chime} from 'aws-sdk';
import {v4 as uuidV4} from 'uuid';
import {Meeting} from 'aws-sdk/clients/chime';

export class JoinMeeting extends BaseRouteHandler {

    private meetingRepo: MeetingRepo;
    private chime: Chime;

    constructor(meetingRepo: MeetingRepo, chime: Chime) {
        super();
        this.meetingRepo = meetingRepo;
        this.chime = chime;
    }

    protected async executeImpl(req: express.Request, res: express.Response): Promise<void | any> {
        const {meetingId, userUuid} = req.body;

        let currentMeeting: Meeting;

        if (!this.meetingRepo.hasMeeting(meetingId)) {
            const createMeetingResponse = await this.chime
                .createMeeting({ClientRequestToken: uuidV4()}).promise();
            if (createMeetingResponse.Meeting) {
                currentMeeting = this.meetingRepo.saveMeeting(meetingId, createMeetingResponse.Meeting);
            } else {
                return this.fail(res, 'Cannot create meeting');
            }
        } else {
            currentMeeting = this.meetingRepo.get(meetingId);
        }

        const joinInfo = {
            meetingId, meeting: currentMeeting, attendee: (
                await this.chime.createAttendee({
                    MeetingId: currentMeeting.MeetingId ? currentMeeting.MeetingId : '',
                    ExternalUserId: userUuid
                }).promise()
            ).Attendee
        };

        return this.ok<typeof joinInfo>(res, joinInfo);
    }

}
