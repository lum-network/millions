import { useState, useEffect, useCallback } from 'react';

const useVisibilityState = () => {
    const [visibilityState, setVisibilityState] = useState<DocumentVisibilityState | null>(null);

    const handleVisbilityChange = useCallback(() => {
        setVisibilityState(document.visibilityState);
    }, [setVisibilityState]);

    useEffect(() => {
        document.addEventListener('visibilitychange', handleVisbilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisbilityChange);
    }, [handleVisbilityChange]);

    return visibilityState;
};

export default useVisibilityState;
