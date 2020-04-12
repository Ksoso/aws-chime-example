import React, {useEffect} from 'react';
import {
    Avatar,
    Button,
    Container,
    Grid,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemSecondaryAction,
    ListItemText,
    Toolbar
} from '@material-ui/core';
import JoinForm from './join/components/JoinForm';
import DeviceManagementForm from './components/DeviceManagement';
import Socket, {EVENTS} from './Socket';
import {Phone as PhoneIcon, Work as WorkIcon} from '@material-ui/icons';
import VideoManager from './containers/VideoManager';
import MeetingAudio from './components/MeetingAudio';
import MeetingManager from './meeting/MeetingManager';

interface UserList {
    [key: string]: {
        userName: string
        uuid: string
    }
}

const MainWindow: React.FC<{ wsConnected: boolean }> = ({wsConnected}) => {

    const [activeUsers, setActiveUsers] = React.useState<UserList>({});
    const [openCallSettings, setOpenCallSettings] = React.useState(false);
    const [selectedUser, setSelectedUser] = React.useState<string | null>(null);
    const [callInProgress, setCallInProgress] = React.useState(false);
    const [meetingId, setMeetingId] = React.useState<string | null>(null);

    useEffect(() => {
        if (wsConnected) {
            Socket.on(EVENTS.USER_LIST, (userList: UserList) => {
                console.log(EVENTS.USER_LIST, userList);
                setActiveUsers(userList);
            });

            Socket.on(EVENTS.CALL_INCOMING, (data: any) => {
                console.log('Call incoming', data);
                const meetingId: string = data.meetingId;
                setMeetingId(meetingId);
                setOpenCallSettings(true);
            });
        }

        return () => {
            Socket.off(EVENTS.USER_LIST);
            Socket.off(EVENTS.CALL_INCOMING);
        };

    }, [wsConnected]);

    return <Container>
        <Grid container spacing={2}>
            <Grid item xs={6}>
                <JoinForm/>
            </Grid>
            {Boolean(Object.keys(activeUsers).length) && <Grid item xs={6}>
                <List>
                    {
                        Object.entries(activeUsers)
                            .filter(([wsId]) => wsId !== Socket.socketId)
                            .map(([wsId, user]) => {
                                return <ListItem key={wsId}>
                                    <ListItemAvatar>
                                        <Avatar>
                                            <WorkIcon/>
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText primary={user.userName}/>
                                    <ListItemSecondaryAction>
                                        <IconButton edge="end" aria-label="call"
                                                    onClick={() => {
                                                        setOpenCallSettings(!openCallSettings);
                                                        setSelectedUser(wsId);
                                                    }}>
                                            <PhoneIcon/>
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>;
                            })
                    }
                </List>
            </Grid>
            }
            {
                openCallSettings && <Grid item xs={12}>
                    <DeviceManagementForm
                        currentUser={Socket.socketId ? activeUsers[Socket.socketId] : null}
                        selectedUser={selectedUser}
                        meetingId={meetingId}
                        onCallStart={() => {
                            setCallInProgress(true);
                            setOpenCallSettings(false);
                        }}/>
                </Grid>
            }
            {
                callInProgress && <Grid item xs={12}>
                    <Toolbar>
                        <Button variant={'contained'} color={'primary'} onClick={async () => {
                            await MeetingManager.endMeeting();
                            console.log('meeting ended');
                        }
                        }>End meeting</Button>
                        <Button variant={'contained'} color={'primary'} onClick={() => {
                            MeetingManager.leaveMeeting();
                        }}>Leave meeting</Button>
                        <Button variant={'contained'} color={'primary'} onClick={async () => {
                            await MeetingManager.startLocalVideo();
                        }}>Start video</Button>
                        <Button variant={'contained'} color={'primary'} onClick={() => {
                            MeetingManager.stopLocalVideo();
                        }}>Stop video</Button>
                        <Button variant={'contained'} color={'primary'} onClick={async () => {
                            await MeetingManager.muteLocalAudio();
                        }}>Mute</Button>
                        <Button variant={'contained'} color={'primary'} onClick={() => {
                            MeetingManager.unmuteLocalAudio();
                        }}>Unmute</Button>
                    </Toolbar>
                    <VideoManager/>
                    <MeetingAudio/>
                </Grid>
            }
        </Grid>
    </Container>;
};

export default MainWindow;
