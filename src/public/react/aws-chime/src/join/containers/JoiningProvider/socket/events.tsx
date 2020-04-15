import {Dispatch} from 'react';
import {Action, Type} from '../reducer';
import Socket, {EVENTS} from '../../../../shared/Socket';

interface UserList {
    [key: string]: {
        wsId: string,
        userName: string,
        uuid: string
    }
}

export default function bindSocketEvents(socket: Socket, dispatch: Dispatch<Action>) {

    socket.on(EVENTS.USER_LIST, (userList: UserList) => {
        dispatch({type: Type.SetActiveUsers, activeUsers: userList});
    });

    socket.on(EVENTS.CALL_STATUS_CHANGE, (data: any) => {
        dispatch({
            type: Type.SetCallStatus,
            callStatus: {status: data.status, meetingId: data.meetingId, recipient: data.sender}
        });
    });

    return () => {
        socket.off(EVENTS.USER_LIST);
        socket.off(EVENTS.CALL_STATUS_CHANGE);
    };
}
