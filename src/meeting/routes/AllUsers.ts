import {BaseRouteHandler} from '../../shared/BaseRouteHandler';
import {UserRepo} from '../repos/UserRepo.interface';
import {Request, Response} from 'express';

export class AllUsers extends BaseRouteHandler {

    constructor(readonly userRepo: UserRepo) {
        super();
    }

    protected async executeImpl(req: Request, res: Response): Promise<void | any> {
        const socketId: string = req.params.socketId;
        if (this.userRepo.exist(socketId)) {
            return this.ok(res, this.userRepo.all());
        }
        return this.ok(res, {});
    }
}
