import {meetingRepo, userRepo} from '../repos';
import {DeleteMeeting} from './DeleteMeeting';
import {JoinMeeting} from './JoinMeeting';
import {AllMeetings} from './AllMeetings';
import {AllUsers} from './AllUsers';
import {MeetingExist} from './MeetingExist';
import {FindUserByAttendeeId} from './FindUserByAttendeeId';

const AWS = require('aws-sdk');
const chime = new AWS.Chime({
    region: 'us-east-1',
    endpoint: 'https://service.chime.aws.amazon.com/console'
});

const joinMeeting = new JoinMeeting(meetingRepo, userRepo, chime);
const deleteMeeting = new DeleteMeeting(meetingRepo, chime);
const allMeetings = new AllMeetings(meetingRepo, chime);
const allUsers = new AllUsers(userRepo);
const meetingExist = new MeetingExist(meetingRepo);
const findUserByAttendeeId = new FindUserByAttendeeId(userRepo);

export {
    joinMeeting, deleteMeeting, allMeetings, allUsers, meetingExist, findUserByAttendeeId
};
