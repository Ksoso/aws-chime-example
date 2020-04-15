import * as express from 'express';
import {BAD_REQUEST, INTERNAL_SERVER_ERROR, NOT_FOUND, OK} from 'http-status-codes';

export abstract class BaseRouteHandler {

    protected abstract executeImpl(req: express.Request, res: express.Response): Promise<void | any>;

    public async execute(req: express.Request, res: express.Response): Promise<void> {
        try {
            await this.executeImpl(req, res);
        } catch (error) {
            console.log('Uncaught controller error');
            console.log(error);
            this.fail(res, 'An unexpected error occurred');
        }
    }

    public static jsonResponse(res: express.Response, code: number, message: string) {
        return res.status(code).json({message});
    }

    public ok<T>(res: express.Response, dto?: T) {
        if (Boolean(dto)) {
            res.type('application/json');
            return res.status(OK).json(dto);
        }
        return res.sendStatus(OK);
    }

    public badRequest(res: express.Response, message: string) {
        return BaseRouteHandler.jsonResponse(res, BAD_REQUEST, 'Bad request');
    }

    public notFound(res: express.Response, message?: string) {
        return BaseRouteHandler.jsonResponse(res, NOT_FOUND, message ? message : 'Not found');
    }

    public fail(res: express.Response, error: Error | string) {
        console.log(error);
        return res.status(INTERNAL_SERVER_ERROR).json({
            message: error.toString()
        });
    }
}
