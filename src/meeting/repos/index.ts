import {MeetingRepoImpl} from './MeetingRepoImpl';
import {UserRepoImpl} from './UserRepoImpl';

const meetingRepo = new MeetingRepoImpl();
const userRepo = new UserRepoImpl();

export {
    meetingRepo, userRepo
};
