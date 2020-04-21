import {BaseRouteHandler} from '../../shared/BaseRouteHandler';
import {Request, Response} from 'express';
import {MeetingRepo} from '../repos/MeetingRepo.interface';

/**
 * Checks if meeting exists, because if meeting exist in cache, other users can also join
 */
export class MeetingExist extends BaseRouteHandler {

    constructor(readonly meetingRepo: MeetingRepo) {
        super();
    }

    /**
     * Expects meetingId uri param
     */
    protected async executeImpl(req: Request, res: Response): Promise<void | any> {
        const meetingId: string = req.params.meetingId;
        return this.ok(res, {exist: this.meetingRepo.exist(meetingId)});
    }

}
