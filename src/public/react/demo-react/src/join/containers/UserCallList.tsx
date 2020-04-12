import React, {useEffect} from 'react';
import {useJoiningProviderDispatcher, useJoiningProviderState} from './JoiningProvider';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    LinearProgress,
    List,
    Typography
} from '@material-ui/core';
import Socket from '../../Socket';
import CallListItem from '../components/CallListItem';
import MeetingManager from '../../meeting/MeetingManager';
import {v4 as uuidV4} from 'uuid';
import {SocketEmitters} from './JoiningProvider/socket/emitters';
import {Type} from './JoiningProvider/reducer';
import {useHistory} from 'react-router-dom';
import routes from '../../routes';

const UserCallList: React.FC = () => {

    const history = useHistory();
    const {activeUsers, callStatus} = useJoiningProviderState();
    const dispatch = useJoiningProviderDispatcher();
    const [openCallDialog, setOpenCallDialog] = React.useState(false);

    const handleOnMakeCallClick = async (e, user) => {
        setOpenCallDialog(true);
        const currentUser = activeUsers[Socket.socketId as string];
        const meetingId = await MeetingManager.joinMeeting(uuidV4(), currentUser.uuid);
        SocketEmitters.callTo(user.wsId, meetingId, currentUser);
        dispatch({
            type: Type.SetCallStatus, callStatus: {
                meetingId, recipient: user, status: 'connecting'
            }
        });
    };

    const handleCallDialogClose = () => {
        setOpenCallDialog(false);
    };

    const handleCallCancel = async () => {
        await MeetingManager.endMeeting();
        setOpenCallDialog(false);
        if (callStatus) {
            const {meetingId, recipient} = callStatus;
            SocketEmitters.declineUserCall(recipient.wsId, meetingId, activeUsers[Socket.socketId as string]);
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
            const currentUser = activeUsers[Socket.socketId as string];
            await MeetingManager.joinMeeting(meetingId, currentUser.uuid);
            SocketEmitters.acceptUserCall(recipient.wsId, meetingId, currentUser);
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

    return <div>
        <Typography component='h1' variant='h4'>Video call phone book</Typography>
        <Divider/>
        <Grid item xs={6}>
            <List style={{width: '100%'}}>
                {
                    Object.values(activeUsers)
                        .map((user) => <CallListItem key={user.wsId} user={user}
                                                     isCurrentUser={user.wsId === Socket.socketId}
                                                     onMakeCallClick={handleOnMakeCallClick}/>)
                }
            </List>
        </Grid>
        {openCallDialog && (isCallingTo || isIncomingCall) &&
        <Dialog open={openCallDialog} onClose={handleCallDialogClose}>
            <DialogTitle>{isCallingTo ? `Calling to ${callStatus?.recipient.userName}`
                : `${callStatus?.recipient.userName} is calling to you`}</DialogTitle>
            <DialogContent>
                <div style={{width: '400px'}}>
                    <LinearProgress/>
                    <LinearProgress color='secondary'/>
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
