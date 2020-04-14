import {meetingRepo} from '../repos';
import {DeleteMeeting} from './DeleteMeeting';
import {JoinMeeting} from './JoinMeeting';
import {AllMeetings} from './AllMeetings';

const AWS = require('aws-sdk');
const chime = new AWS.Chime({
    region: 'us-east-1',
    endpoint: 'https://service.chime.aws.amazon.com/console'
});

console.log(meetingRepo);

const joinMeeting = new JoinMeeting(meetingRepo, chime);
const deleteMeeting = new DeleteMeeting(meetingRepo, chime);
const allMeetings = new AllMeetings(meetingRepo, chime);

export {
    joinMeeting, deleteMeeting, allMeetings
};