import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { I18n, TimesUtils } from 'utils';

interface IProps {
    to: string;
}

const RoundTimer = ({ to }: IProps) => {
    const [remainingTime, setRemainingTime] = useState(0);
    const [days, setDays] = useState(0);
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(0);
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        setRemainingTime(dayjs().diff(dayjs(to), 'seconds'));
    }, [to]);

    useEffect(() => {
        const interval = setInterval(() => {
            setRemainingTime(remainingTime - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [remainingTime]);

    useEffect(() => {
        if (remainingTime < 0) {
            setRemainingTime(0);

            // TODO: Countdown is over, do something
        }

        const [days, hours, minutes, seconds] = TimesUtils.getDaysHoursMinutesSeconds(remainingTime);

        setDays(days);
        setHours(hours);
        setMinutes(minutes);
        setSeconds(seconds);
    }, [remainingTime]);

    return (
        <div>
            {!!days && (
                <div>
                    <span>{days}</span> <span>{I18n.t('countDown.days', { count: days })}</span>
                </div>
            )}
            {!days && (
                <>
                    <div>
                        <span>
                            {hours}:{minutes}:{seconds}
                        </span>
                    </div>
                </>
            )}
        </div>
    );
};

export default RoundTimer;
