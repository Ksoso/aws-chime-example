import {meetingRepo} from '../repos';
import {userRepo} from '../../user/repos';
import {DeleteMeeting} from './DeleteMeeting';
import {JoinMeeting} from './JoinMeeting';
import {CleanupMeetings} from './CleanupMeetings';
import {MeetingExist} from './MeetingExist';

const AWS = require('aws-sdk');
const chime = new AWS.Chime({
    region: 'us-east-1',
    endpoint: 'https://service.chime.aws.amazon.com/console'
});

const joinMeeting = new JoinMeeting(meetingRepo, userRepo, chime);
const deleteMeeting = new DeleteMeeting(meetingRepo, chime);
const cleanMeetings = new CleanupMeetings(meetingRepo, chime);
const meetingExist = new MeetingExist(meetingRepo);

export {
    joinMeeting, deleteMeeting, cleanMeetings, meetingExist
};
