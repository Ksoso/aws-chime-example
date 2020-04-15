import React, {useCallback} from 'react';
import {
    Avatar,
    Divider,
    IconButton,
    ListItem,
    ListItemAvatar,
    ListItemSecondaryAction,
    ListItemText
} from '@material-ui/core';
import {Phone as PhoneIcon, Work as WorkIcon} from '@material-ui/icons';

type CallListItemProps = {
    user: { wsId: string, userName: string, uuid: string };
    isCurrentUser: boolean;
    onMakeCallClick?: (e: React.MouseEvent<HTMLButtonElement>, user: { userName: string, uuid: string }) => void;
}

const CallListItem: React.FC<CallListItemProps> = ({isCurrentUser, user, onMakeCallClick}) => {

    const handleMakeCallClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        onMakeCallClick && onMakeCallClick(e, user);
    }, [onMakeCallClick, user]);

    return (
        <>
            <ListItem>
                <ListItemAvatar>
                    <Avatar>
                        <WorkIcon/>
                    </Avatar>
                </ListItemAvatar>
                <ListItemText primary={user.userName}/>
                <ListItemSecondaryAction>
                    {!isCurrentUser &&
                    <IconButton edge="end" aria-label="call" onClick={handleMakeCallClick}>
                        <PhoneIcon/>
                    </IconButton>}
                </ListItemSecondaryAction>
            </ListItem>
            <Divider variant='fullWidth' component='li'/>
        </>
    );
};

export default CallListItem;
