import {DemoRoute} from './routes/DemoRoute';
import {Router} from 'express';

const demoRouter: Router = Router();
const demoRouteHandler = new DemoRoute();

demoRouter.get('/:name',
    (req, res) => demoRouteHandler.execute(req, res));

export {
    demoRouter
};
