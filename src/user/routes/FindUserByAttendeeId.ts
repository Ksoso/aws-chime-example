import {BaseRouteHandler} from '../../shared/BaseRouteHandler';
import {Request, Response} from 'express';
import {UserRepo} from '../repos/UserRepo.interface';
import {User} from '../../shared/User.interface';

export class FindUserByAttendeeId extends BaseRouteHandler {

    constructor(readonly userRepo: UserRepo) {
        super();
    }

    protected async executeImpl(req: Request, res: Response): Promise<void | any> {
        const attendeeId: string = req.params.attendeeId;
        const userByAttendeeId = Object.values(this.userRepo.all())
            .find(u => attendeeId === u.attendeeId);

        if (userByAttendeeId) {
            return this.ok<User>(res, userByAttendeeId);
        }
        return this.notFound(res);
    }

}
