import {Controller, Delete, Get, Post} from '@overnightjs/core';
import {Logger} from '@overnightjs/logger';
import {BAD_REQUEST, CREATED, NO_CONTENT, OK} from 'http-status-codes';
import {Request, Response} from 'express';
import {v4 as uuidV4} from 'uuid';

const AWS = require('aws-sdk');

interface LocalCache {
    [key: string]: any
}

@Controller('api/meeting')
export default class JoinMeetingController {

    private chime = new AWS.Chime({
        region: 'us-east-1',
        endpoint: 'https://service.chime.aws.amazon.com/console'
    });

    private meetingCache: LocalCache = {};
    private attendeeCache: LocalCache = {};

    @Get()
    private async allMeetings(req: Request, res: Response){
        const meetingResp = await this.chime.listMeetings().promise();
        for(const meeting of meetingResp.Meetings){
            await this.chime.deleteMeeting({
                MeetingId: meeting.MeetingId
            })
        }

        return res.status(OK).json(meetingResp.Meetings);
    }

    @Post('join')
    private async joinMeeting(req: Request, res: Response) {
        Logger.Info(req.body, true);
        const {meetingId, userUuid} = req.body;
        try {
            if (!this.meetingCache[meetingId]) {
                this.meetingCache[meetingId] = await this.chime.createMeeting({
                    ClientRequestToken: uuidV4()
                }).promise();
            }

            const joinInfo = {
                JoinInfo: {
                    Title: meetingId,
                    Meeting: this.meetingCache[meetingId].Meeting,
                    Attendee: (
                        await this.chime
                            .createAttendee({
                                MeetingId: this.meetingCache[meetingId].Meeting.MeetingId,
                                ExternalUserId: userUuid,
                            })
                            .promise()
                    ).Attendee,
                },
            };
            return res.status(CREATED).json(joinInfo);
        } catch (e) {
            return res.status(BAD_REQUEST).json({
                message: e.message
            });
        }
    }

    @Delete(':title')
    private async deleteMeeting(req: Request, res: Response) {
        const title = req.params.title;
        if (this.meetingCache[title]) {
            try {
                await this.chime.deleteMeeting({
                    MeetingId: this.meetingCache[title].Meeting.MeetingId
                }).promise();
                return res.status(NO_CONTENT).send();
            } catch (e) {
                Logger.Err(e, true);
                return res.status(BAD_REQUEST).json({message: e.message});
            }
        }
        return res.status(BAD_REQUEST).json({message: `meeting with title: ${title} not found`});
    }

}
