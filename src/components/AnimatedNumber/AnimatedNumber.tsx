import React, { useState, useEffect } from 'react';
import { useSpring, animated } from 'react-spring';

interface IProps {
    number: number;
    duration?: number;
    delay?: number;
}

const Counter = ({ number, duration = 1000, delay = 1000 }: IProps) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCount(number);
        }, delay);

        return () => clearInterval(interval);
    }, []);

    const countSpring = useSpring({
        to: { count, transform: `translate3d(${0}px, 0, 0)` },
        from: { count: 0, transform: 'translate3d(0, 0, 0)' },
        config: { duration: duration },
    });

    return (
        <div className='counter'>
            <animated.span style={countSpring}>{countSpring.count.interpolate((val) => Math.floor(val))}</animated.span>
        </div>
    );
};

export default Counter;
