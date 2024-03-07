import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { I18n, TimesUtils } from 'utils';
import numeral from 'numeral';

interface IProps {
    to: Date;
    onCountdownEnd?: () => void;
    homePage?: boolean;
    simple?: boolean;
}

const RoundTimer = ({ to, onCountdownEnd, homePage, simple }: IProps) => {
    const [remainingTime, setRemainingTime] = useState(0);
    const [days, setDays] = useState(0);
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(0);
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        setRemainingTime(dayjs(to).diff(dayjs(), 'seconds'));
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

    if (simple) {
        return (
            <div>
                <span>{days ? `${days}d ` : hours ? `${hours}h ` : minutes ? `${minutes}m ` : seconds ? `${seconds}s ` : ''}</span>
            </div>
        );
    }

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

    return !!days ? (
        <>
            {days} {I18n.t('countDown.days', { count: days })} {hours} {I18n.t('countDown.hours', { count: hours })}
        </>
    ) : (
        <>
            <div>
                <span>
                    {numeral(hours).format('00')}:{numeral(minutes).format('00')}:{numeral(seconds).format('00')}
                </span>
            </div>
        </>
    );
};

export default RoundTimer;
