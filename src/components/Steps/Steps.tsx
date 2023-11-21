import React, { useEffect, useState } from 'react';

import Assets from 'assets';

import './Steps.scss';
import { useColorScheme } from 'hooks';

interface Props {
    steps: { title: string; subtitle: string }[];
    currentStep: number;
    stepBackgroundColor?: string;
    lastStepChecked?: boolean;
}

const Steps = ({ steps, currentStep, stepBackgroundColor, lastStepChecked }: Props) => {
    const { isDark } = useColorScheme();
    const [colorBg, setColorBg] = useState(getComputedStyle(document.body).getPropertyValue('--color-background'));

    useEffect(() => {
        setColorBg(getComputedStyle(document.body).getPropertyValue('--color-background'));
    }, [isDark]);

    return (
        <div className='steps'>
            {steps.map((step, index) => {
                const completed = currentStep > index || (currentStep === steps.length - 1 && lastStepChecked);
                const active = currentStep === index;

                return (
                    <div key={index} className={`step ${index + 1 < steps.length ? 'with-line pb-5' : ''} ${completed ? 'completed' : active ? 'active' : ''}`}>
                        <div className='d-flex flex-row'>
                            <div className='overflow-visible step-index-container'>
                                <div className='position-absolute top-0 start-0 index-default-border' />
                                {!completed && <div className='position-absolute top-0 start-0 index-border' />}
                                <div className='index-container position-relative' style={{ '--step-bg-color': stepBackgroundColor || colorBg } as React.CSSProperties}>
                                    <div className='index-text'>{index + 1}</div>
                                    <div style={{ zIndex: 1 }} className='checkmark-container d-flex align-items-center justify-content-center position-absolute rounded-circle'>
                                        <img src={Assets.images.checkmark} alt='checkmark' />
                                    </div>
                                </div>
                            </div>
                            <p className='title mb-0'>{step.title}</p>
                        </div>
                        <p className='subtitle mb-0'>{step.subtitle}</p>
                    </div>
                );
            })}
        </div>
    );
};

export default Steps;
