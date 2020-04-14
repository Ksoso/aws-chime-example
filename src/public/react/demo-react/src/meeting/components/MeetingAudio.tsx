import React, {useEffect, useRef} from 'react';
import MeetingManager from '../../shared/MeetingManager';

const MeetingAudio: React.FC<{ meetingManager: MeetingManager }> = ({meetingManager}) => {
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        if (!audioRef.current) {
            return;
        }
        meetingManager.bindAudioElement(audioRef.current);
        return () => meetingManager.unbindAudioElement();
    }, [audioRef, meetingManager]);

    return <audio ref={audioRef} style={{display: 'none'}}/>;
};

export default MeetingAudio;
