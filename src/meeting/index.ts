import {
    allMeetings,
    allUsers,
    deleteMeeting,
    findUserByAttendeeId,
    joinMeeting,
    meetingExist
} from './routes';

import {Router} from 'express';

const meetingRouter: Router = Router();

meetingRouter.get('',
    (req, res) => allMeetings.execute(req, res));
meetingRouter.post('/join',
    (req, res) => joinMeeting.execute(req, res));
meetingRouter.delete('/:meetingId',
    (req, res) => deleteMeeting.execute(req, res));
meetingRouter.get('/exist/:meetingId',
    (req, res) => meetingExist.execute(req, res));

meetingRouter.get('/users/:socketId', (req, res) => allUsers.execute(req, res));
meetingRouter.get('/users/attendees/:attendeeId', (req, res) => findUserByAttendeeId.execute(req, res));

export {
    meetingRouter
};
