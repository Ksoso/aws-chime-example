import {allUsers, findUserByAttendeeId} from './routes';

import {Router} from 'express';

const usersRouter: Router = Router();

usersRouter.get('/:socketId', allUsers.execute);
usersRouter.get('/attendees/:attendeeId', findUserByAttendeeId.execute);

export {
    usersRouter
};
