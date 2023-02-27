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
        <div className='row g-3 g-xxl-4'>
            {!!days && (
                <div className='col-lg-3 col-sm-6'>
                    <span className='countdown-number me-2'>{days}</span> <span className='countdown-unit'>{I18n.t('countDown.days', { count: days })}</span>
                </div>
            )}
            <div className='col-lg-3 col-sm-6'>
                <span className='countdown-number me-2'>{hours}</span> <span className='countdown-unit'>{I18n.t('countDown.hours', { count: hours })}</span>
            </div>
            <div className='col-lg-3 col-sm-6'>
                <span className='countdown-number me-2'>{minutes}</span> <span className='countdown-unit'>{I18n.t('countDown.minutes', { count: minutes })}</span>
            </div>
            {!days && (
                <div className='col-lg-3 col-sm-6'>
                    <span className='countdown-number me-2'>{seconds}</span> <span className='countdown-unit'>{I18n.t('countDown.seconds', { count: seconds })}</span>
                </div>
            )}
        </div>
    );
};

export default RoundTimer;
