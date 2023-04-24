import React from 'react';

import Assets from 'assets';

import './Steps.scss';

interface Props {
    steps: { title: string; subtitle: string }[];
    currentStep: number;
    stepBackgroundColor?: string;
    lastStepChecked?: boolean;
}

const Steps = ({ steps, currentStep, stepBackgroundColor, lastStepChecked }: Props) => {
    return (
        <div className='steps'>
            {steps.map((step, index) => {
                const completed = currentStep > index || (currentStep === steps.length - 1 && lastStepChecked);
                return (
                    <div key={index} className={`step ${index + 1 < steps.length ? 'with-line pb-5' : ''} ${completed ? 'completed' : currentStep === index ? 'active' : ''}`}>
                        <div className='d-flex flex-row'>
                            <div className='step-index-container' style={{ '--step-bg-color': stepBackgroundColor || '#F4F4F4' } as React.CSSProperties}>
                                {completed ? <img src={Assets.images.checkmark} alt='checkmark' /> : index + 1}
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
