import * as io from 'socket.io-client';

export const EVENTS = {
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    USER_LIST: 'userList',
    JOIN_USER: 'userJoin',
    CALL_INCOMING: 'callIncoming',
    CALL_TO_USER: 'callToUser'
};

class Socket {

    private _isConnected: boolean = false;
    private socket: any;

    public socketId?: string;

    public connect(url: string, onFinish: (connected: boolean) => void) {
        this.socket = io.connect(url);
        this.socket.on(EVENTS.CONNECT, () => {
            this._isConnected = true;
            this.socketId = this.socket.id;
            onFinish(this.isConnected);
        });
    }

    get isConnected(): boolean {
        return this._isConnected;
    }

    public on(eventName: string, callback: Function) {
        if (this.isConnected) {
            this.socket.on(eventName, callback);
        }
    }

    public emit(eventName: string, data: { [key: string]: any }, callback?: Function) {
        if (this.isConnected) {
            this.socket.emit(eventName, data, callback);
        }
    }

    public off(eventName: string, callback?: Function) {
        if(this.isConnected){
            this.socket.off(eventName, callback);
        }
    }

    public disconnect() {
        this.socket.close();
    }
}

export default new Socket();
