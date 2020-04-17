import {UserRepo} from '../repos/UserRepo.interface';
import {Server, Socket} from 'socket.io';

export enum Events {
    Subscribe = 'subscribe',
    UserList = 'userList',
    CallToUser = 'callToUser',
    CallStatusChange = 'callStatusChange',
    AcceptUserCall = 'acceptUserCall',
    DeclineUserCall = 'declineUserCall',
    Exit = 'exit',
    Disconnect = 'disconnect',
}

export class UserSocketHandler {

    constructor(readonly userRepo: UserRepo, readonly socket: Socket, readonly server: Server) {
    }

    init() {
        this.socket.on(Events.Subscribe, this.subscribeListener);
        this.socket.on(Events.CallToUser, this.callToUserListener);
        this.socket.on(Events.AcceptUserCall, this.acceptUserCallListener);
        this.socket.on(Events.DeclineUserCall, this.declineUserCallListener);
        this.socket.on(Events.Disconnect, this.disconnectListener);
    }

    subscribeListener = (data: any) => {
        const socketId = this.socket.id;
        if (this.userRepo.exist(socketId)) {
            this.userRepo.updateUser(socketId, {userName: data.userName as string});
        } else {
            this.userRepo.saveUser({
                wsId: socketId, userName: data.userName
            });
        }
        this.server.emit(Events.UserList, this.userRepo.all());
    };

    callToUserListener = (data: any) => {
        this.socket.broadcast.to(data.recipientWsId).emit(Events.CallStatusChange, {
            meetingId: data.meetingId, sender: data.sender, status: 'incoming'
        });
    };

    acceptUserCallListener = (data: any) => {
        this.socket.broadcast.to(data.recipientWsId).emit(Events.CallStatusChange, {
            meetingId: data.meetingId, sender: data.sender, status: 'in-progress'
        });
    };

    declineUserCallListener = (data: any) => {
        this.socket.broadcast.to(data.recipientWsId).emit(Events.CallStatusChange, {
            meetingId: data.meetingId, sender: data.sender, status: 'rejected'
        });
    };

    disconnectListener = () => {
        this.userRepo.deleteUser(this.socket.id);
        this.server.emit(Events.Exit, this.userRepo.all());
    };
}
