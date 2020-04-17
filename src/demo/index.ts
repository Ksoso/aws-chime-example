import {DemoRoute} from './routes/DemoRoute';
import {Router} from 'express';

const demoRouter: Router = Router();
const demoRouteHandler = new DemoRoute();

demoRouter.get('/:name', demoRouteHandler.execute);

export {
    demoRouter
};
