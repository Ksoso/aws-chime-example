import React from 'react';
import {createStyles, Divider, Paper, Theme, withStyles} from '@material-ui/core';
import {ToggleButton, ToggleButtonGroup} from '@material-ui/lab';
import {
    ExitToApp as LeaveIcon,
    Headset as SpeakerIcon,
    Mic as MicIcon,
    PhoneDisabled as EndMeetingIcon,
    Videocam as VideoCamIcon
} from '@material-ui/icons';
import {makeStyles} from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        paper: {
            display: 'flex',
            border: `1px solid ${theme.palette.divider}`,
            flexWrap: 'wrap',
        },
        divider: {
            alignSelf: 'stretch',
            height: 'auto',
            margin: theme.spacing(1, 0.5),
        },
    }), {name: 'MeetingToolbar'}
);

const StyledToggleButtonGroup = withStyles((theme) => ({
    grouped: {
        margin: theme.spacing(0.5),
        border: 'none',
        padding: theme.spacing(0, 1),
        '&:not(:first-child)': {
            borderRadius: theme.shape.borderRadius,
        },
        '&:first-child': {
            borderRadius: theme.shape.borderRadius,
        },
    },
}))(ToggleButtonGroup);

type ToolbarProps = {
    onToolbarClick?: (prevActiveButtons: string[], newActiveButtons: string[]) => void
}

const Toolbar: React.FC<ToolbarProps> = ({onToolbarClick}) => {
    const classes = useStyles();

    const [media, setMedia] = React.useState(() => ['audioIn', 'audioOut']);

    const handleChange = (type: string) => (event: React.MouseEvent<HTMLElement>, newBtnStates: string[]) => {

        const actualButtonState = [...media];
        let nextButtonState: string[] = [];

        //meeting toggle buttons are treated as regular buttons
        switch (type) {
            case 'media':
                nextButtonState = [...newBtnStates];
                setMedia(newBtnStates);
                break;
            case 'meeting':
                nextButtonState = [...media, ...newBtnStates];
                break;
            default:
                break;
        }

        if (onToolbarClick) {
            onToolbarClick(actualButtonState, nextButtonState);
        }
    };

    return <Paper className={classes.paper}>
        <StyledToggleButtonGroup value={media} onChange={handleChange('media')}>
            <ToggleButton value='videoIn' aria-label='turn on/off video camera'>
                <VideoCamIcon/>
            </ToggleButton>
            <ToggleButton value='audioIn' aria-label='turn on/off microphone'>
                <MicIcon/>
            </ToggleButton>
            <ToggleButton value='audioOut' aria-label='turn on/off speakers'>
                <SpeakerIcon/>
            </ToggleButton>
        </StyledToggleButtonGroup>
        <Divider orientation={'vertical'} className={classes.divider}/>
        <StyledToggleButtonGroup onChange={handleChange('meeting')}>
            <ToggleButton value='leaveMeeting' aria-label='Leave meeting'>
                <LeaveIcon/>
            </ToggleButton>
            <ToggleButton value='endMeeting' aria-label='End meeting'>
                <EndMeetingIcon/>
            </ToggleButton>
        </StyledToggleButtonGroup>
    </Paper>;
};

export default Toolbar;
