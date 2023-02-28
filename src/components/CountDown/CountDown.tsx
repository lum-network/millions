import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { I18n, TimesUtils } from 'utils';
import numeral from 'numeral';

interface IProps {
    to: string;
    onCountdownEnd?: () => void;

    homePage?: boolean;
}

const RoundTimer = ({ to, onCountdownEnd, homePage }: IProps) => {
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

            if (onCountdownEnd) {
                onCountdownEnd();
            }
        }

        const [days, hours, minutes, seconds] = TimesUtils.getDaysHoursMinutesSeconds(remainingTime);

        setDays(days);
        setHours(hours);
        setMinutes(minutes);
        setSeconds(seconds);
    }, [remainingTime]);

    if (homePage) {
        return (
            <div className='countdown'>
                {!!days && (
                    <div className='number-unit-container'>
                        <div className='number'>{numeral(days).format('00')}</div>
                        <span className='unit'>{I18n.t('countDown.days', { count: days })}</span>
                    </div>
                )}

                <div className='number-unit-container'>
                    <div className='number'>{numeral(hours).format('00')}</div>
                    <span className='unit'>{I18n.t('countDown.hours', { count: hours })}</span>
                </div>
                <div className='number-unit-container'>
                    <div className='number'>{numeral(minutes).format('00')}</div>
                    <span className='unit'>{I18n.t('countDown.minutes', { count: minutes })}</span>
                </div>
                {!days && (
                    <div className='number-unit-container'>
                        <div className='number'>{numeral(seconds).format('00')}</div>
                        <span className='unit'>{I18n.t('countDown.seconds', { count: seconds })}</span>
                    </div>
                )}
            </div>
        );
    }

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
                            {numeral(hours).format('00')}:{numeral(minutes).format('00')}:{numeral(seconds).format('00')}
                        </span>
                    </div>
                </>
            )}
        </div>
    );
};

export default RoundTimer;
