import {allMeetings, deleteMeeting, joinMeeting, meetingExist} from './routes';

import {Router} from 'express';

const meetingRouter: Router = Router();

meetingRouter.get('', allMeetings.execute);
meetingRouter.post('/join', joinMeeting.execute);
meetingRouter.delete('/:meetingId', deleteMeeting.execute);
meetingRouter.get('/exist/:meetingId', meetingExist.execute);

export {
    meetingRouter
};
