import Socket, {EVENTS} from '../../../../Socket';

function subscribe(formState: { userName: string }) {
    Socket.emit(EVENTS.SUBSCRIBE, formState);
}

function callTo(recipientWsId: string, meetingId: string, sender) {
    Socket.emit(EVENTS.CALL_TO_USER, {
        recipientWsId, meetingId, sender
    });
}

function acceptUserCall(recipientWsId: string, meetingId: string, sender) {
    Socket.emit(EVENTS.ACCEPT_USER_CALL, {
        recipientWsId, meetingId, sender
    });
}

function declineUserCall(recipientWsId: string, meetingId: string, sender) {
    Socket.emit(EVENTS.DECLINE_USER_CALL, {
        recipientWsId, meetingId, sender
    });
}

export const SocketEmitters = {
    subscribe, callTo, acceptUserCall, declineUserCall
};
