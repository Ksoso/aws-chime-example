import React, {useEffect, useRef} from 'react';
import MeetingManager from '../meeting/MeetingManager';

const MeetingAudio: React.FC = () => {
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        if (!audioRef.current) {
            return;
        }

        MeetingManager.bindAudioElement(audioRef.current);

        return () => MeetingManager.unbindAudioElement();
    }, [audioRef]);

    return <audio ref={audioRef} style={{display: 'none'}}/>;
};

export default MeetingAudio;
