import React, {useEffect} from 'react';
import {useJoiningProviderDispatcher, useJoiningProviderState} from './JoiningProvider';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    LinearProgress,
    List,
    Typography
} from '@material-ui/core';
import CallListItem from '../components/CallListItem';
import {v4 as uuidV4} from 'uuid';
import {socketEmit} from './JoiningProvider/socket/emitters';
import {Type} from './JoiningProvider/reducer';
import {useHistory} from 'react-router-dom';
import routes from '../../routes';
import {useMeetingProviderState} from '../../shared';

const UserCallList: React.FC = () => {

    const history = useHistory();
    const {activeUsers, callStatus} = useJoiningProviderState();
    const {meetingManager, socket} = useMeetingProviderState();
    const dispatch = useJoiningProviderDispatcher();
    const [openCallDialog, setOpenCallDialog] = React.useState(false);

    const handleOnMakeCallClick = async (e, user) => {
        setOpenCallDialog(() => true);
        let meetingId = uuidV4();
        dispatch({
            type: Type.SetCallStatus, callStatus: {
                meetingId, recipient: user, status: 'connecting'
            }
        });
        const currentUser = activeUsers[socket.socketId as string];
        meetingId = await meetingManager.joinMeeting(meetingId, currentUser.uuid);
        socketEmit(socket).callTo(user.wsId, meetingId, currentUser);
    };

    const handleCallDialogClose = () => {
        setOpenCallDialog(false);
    };

    const handleCallCancel = async () => {
        await meetingManager.endMeeting();
        setOpenCallDialog(false);
        if (callStatus) {
            const {meetingId, recipient} = callStatus;
            socketEmit(socket).declineUserCall(recipient.wsId, meetingId, activeUsers[socket.socketId as string]);
            dispatch({
                type: Type.SetCallStatus,
                callStatus: {...callStatus, status: 'rejected'}
            });
        }
    };

    const handleCallAccept = async () => {
        setOpenCallDialog(false);
        if (callStatus) {
            const {meetingId, recipient} = callStatus;
            const currentUser = activeUsers[socket.socketId as string];
            await meetingManager.joinMeeting(meetingId, currentUser.uuid);
            socketEmit(socket).acceptUserCall(recipient.wsId, meetingId, currentUser);
            dispatch({
                type: Type.SetCallStatus,
                callStatus: {...callStatus, status: 'in-progress'}
            });
        }
    };

    useEffect(() => {
        if (callStatus) {
            if ('in-progress' === callStatus.status) {
                history.push(routes.SETTINGS);
            } else if ('incoming' === callStatus.status) {
                setOpenCallDialog(true);
            }
        }
    }, [callStatus, history]);

    const isCallingTo = Boolean(callStatus && 'connecting' === callStatus.status);
    const isIncomingCall = Boolean(callStatus && 'incoming' === callStatus.status);

    const isUserLoggedIn = Object.keys(activeUsers).some(key => key === socket.socketId);

    return <div>
        <Typography component='h1' variant='h4'>Video call phone book</Typography>
        <Divider/>
        <List style={{width: '100%'}}>
            {
                isUserLoggedIn && Object.values(activeUsers)
                    .map((user) => <CallListItem key={user.wsId} user={user}
                                                 isCurrentUser={user.wsId === socket.socketId}
                                                 onMakeCallClick={handleOnMakeCallClick}/>)
            }
        </List>
        {openCallDialog && (isCallingTo || isIncomingCall) &&
        <Dialog open={openCallDialog} onClose={handleCallDialogClose} disableBackdropClick>
            <DialogTitle>{isCallingTo ? `Calling to ${callStatus?.recipient.userName}`
                : `${callStatus?.recipient.userName} is calling to you`}</DialogTitle>
            <DialogContent>
                <div style={{width: '400px'}}>
                    <LinearProgress/>
                    <LinearProgress color='secondary' style={{marginTop: '5px'}}/>
                </div>
            </DialogContent>
            <DialogActions>
                <DialogActions>
                    {isIncomingCall && <Button onClick={handleCallAccept} color="primary">
                        Accept
                    </Button>}
                    <Button onClick={handleCallCancel} color="primary">
                        Cancel
                    </Button>
                </DialogActions>
            </DialogActions>
        </Dialog>}
    </div>;
};

export default UserCallList;
