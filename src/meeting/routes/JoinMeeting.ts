import {BaseRouteHandler} from '../../shared/BaseRouteHandler';
import * as express from 'express';
import {Chime} from 'aws-sdk';
import {v4 as uuidV4} from 'uuid';
import {Meeting} from 'aws-sdk/clients/chime';
import {MeetingRepo} from '../repos/MeetingRepo.interface';
import {UserRepo} from '../repos/UserRepo.interface';
import {User} from '../../shared/User.interface';

export class JoinMeeting extends BaseRouteHandler {

    constructor(readonly meetingRepo: MeetingRepo, readonly userRepo: UserRepo, readonly chime: Chime) {
        super();
    }

    protected async executeImpl(req: express.Request, res: express.Response): Promise<void | any> {
        const {meetingId, userUuid} = req.body;

        let currentMeeting: Meeting;

        if (!this.meetingRepo.exist(meetingId)) {
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

        const userByUuid: User | undefined = Object.values(this.userRepo.all()).find(u => u.uuid === userUuid);
        if (userByUuid) {
            this.userRepo.updateUser(userByUuid.wsId, {
                attendeeId: joinInfo.attendee?.AttendeeId,
                meetingId
            });
        }

        return this.ok<typeof joinInfo>(res, joinInfo);
    }

}
