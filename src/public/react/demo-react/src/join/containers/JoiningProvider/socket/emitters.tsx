import Socket, {EVENTS} from '../../../../shared/Socket';

export const socketEmit = (socket: Socket) => {
    return {
        subscribe: function(formState: { userName: string }) {
            socket.emit(EVENTS.SUBSCRIBE, formState);
        },
        callTo: function(recipientWsId: string, meetingId: string, sender) {
            socket.emit(EVENTS.CALL_TO_USER, {
                recipientWsId, meetingId, sender
            });
        },
        acceptUserCall: function(recipientWsId: string, meetingId: string, sender) {
            socket.emit(EVENTS.ACCEPT_USER_CALL, {
                recipientWsId, meetingId, sender
            });
        },
        declineUserCall: function(recipientWsId: string, meetingId: string, sender) {
            socket.emit(EVENTS.DECLINE_USER_CALL, {
                recipientWsId, meetingId, sender
            });
        }
    };
};
