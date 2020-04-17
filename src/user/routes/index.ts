import {FindUserByAttendeeId} from './FindUserByAttendeeId';
import {userRepo} from '../repos';
import {AllUsers} from './AllUsers';

const findUserByAttendeeId = new FindUserByAttendeeId(userRepo);
const allUsers = new AllUsers(userRepo);

export {
    findUserByAttendeeId, allUsers
};
