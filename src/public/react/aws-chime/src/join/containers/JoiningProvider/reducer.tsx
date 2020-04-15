export interface CallStatus {
    meetingId: string,
    status: 'connecting' | 'rejected' | 'in-progress' | 'incoming',
    recipient: {
        wsId: string,
        userName: string
        uuid: string
    }
}

export interface State {
    wsConnected: boolean;
    activeUsers: UserList;
    callStatus?: CallStatus;
}

export enum Type {
    WsConnected = 'WS_CONNECTED',
    SetActiveUsers = 'SET_ACTIVE_USERS',
    SetCallStatus = 'SET_CALL_STATUS',
}

export interface UserList {
    [key: string]: {
        wsId: string,
        userName: string
        uuid: string
    }
}

export const initialState: State = {
    wsConnected: false,
    activeUsers: {} as UserList
};

export type Action =
    | { type: Type.SetActiveUsers, activeUsers: UserList }
    | { type: Type.WsConnected, connected: boolean }
    | { type: Type.SetCallStatus, callStatus?: CallStatus }

export function reducer(state: State, action: Action): State {
    switch (action.type) {
        case Type.WsConnected:
            return {
                ...state,
                wsConnected: action.connected
            };
        case Type.SetActiveUsers:
            return {
                ...state,
                activeUsers: action.activeUsers
            };
        case Type.SetCallStatus:
            let callStatus = state.callStatus ? {...state.callStatus, ...action.callStatus} : action.callStatus;
            return {
                ...state, callStatus
            };
        default:
            return state;
    }
}
