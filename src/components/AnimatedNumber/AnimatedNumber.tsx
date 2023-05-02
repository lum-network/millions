import React, { useState, useEffect } from 'react';
import { useSpring, animated, easings } from 'react-spring';

import './AnimatedNumber.scss';

interface IProps {
    number: number;
    duration?: number;
    delay?: number;
}

const Counter = ({ number, duration = 1500, delay = 500 }: IProps) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCount(number);
        }, delay);

        return () => clearInterval(interval);
    }, []);

    const countSpring = useSpring({
        to: { count, transform: `translateY(0px)` },
        from: { count: 0, transform: 'translateY(0px)' },
        config: { duration, easing: easings.easeOutExpo },
    });

    return (
        <div className='counter'>
            <animated.span style={countSpring}>{countSpring.count.to((val) => Math.floor(val).toLocaleString())}</animated.span>
        </div>
    );
};

export default Counter;
