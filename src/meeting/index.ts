import {allMeetings, deleteMeeting, joinMeeting} from './routes';

import {Router} from 'express';

const meetingRouter: Router = Router();

meetingRouter.get('',
    (req, res) => allMeetings.execute(req, res));
meetingRouter.post('/join',
    (req, res) => joinMeeting.execute(req, res));
meetingRouter.delete('/:meetingId',
    (req, res) => deleteMeeting.execute(req, res));

export {
    meetingRouter
};
