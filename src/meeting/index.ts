import {cleanMeetings, deleteMeeting, joinMeeting, meetingExist} from './routes';

import {Router} from 'express';

const meetingRouter: Router = Router();

meetingRouter.get('/cleanup', cleanMeetings.execute);
meetingRouter.post('/join', joinMeeting.execute);
meetingRouter.delete('/:meetingId', deleteMeeting.execute);
meetingRouter.get('/exist/:meetingId', meetingExist.execute);

export {
    meetingRouter
};
