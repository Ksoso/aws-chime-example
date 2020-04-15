import {BaseRouteHandler} from '../../shared/BaseRouteHandler';
import {Request, Response} from 'express';
import {MeetingRepo} from '../repos/MeetingRepo.interface';

export class MeetingExist extends BaseRouteHandler {

    constructor(readonly meetingRepo: MeetingRepo) {
        super();
    }

    protected async executeImpl(req: Request, res: Response): Promise<void | any> {
        const meetingId: string = req.params.meetingId;
        return this.ok(res, {exist: this.meetingRepo.exist(meetingId)});
    }

}
