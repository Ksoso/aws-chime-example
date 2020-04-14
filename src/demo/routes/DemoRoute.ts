import {BaseRouteHandler} from '../../shared/BaseRouteHandler';
import {Request, Response} from 'express';
import {OK} from 'http-status-codes';

export class DemoRoute extends BaseRouteHandler {

    public static readonly SUCCESS_MSG = 'hello';

    protected async executeImpl(req: Request, res: Response): Promise<void | any> {
        const {name} = req.params;
        if (name === 'make_it_fail') {
            throw Error('User triggered failure');
        }
        console.log(DemoRoute.SUCCESS_MSG + name);
        return DemoRoute.jsonResponse(res, OK, DemoRoute.SUCCESS_MSG + name);
    }

}
