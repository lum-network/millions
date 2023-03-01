import React from 'react';

import checkmark from 'assets/images/checkmark.svg';

import './Steps.scss';

interface Props {
    steps: { title: string; subtitle: string }[];
    currentStep: number;
}

const Steps = ({ steps, currentStep }: Props) => {
    return (
        <div className='steps'>
            {steps.map((step, index) => (
                <div key={index} className={`step ${index < steps.length ? ' mb-5' : ''} ${currentStep === index ? 'active' : currentStep > index ? 'completed' : ''}`}>
                    <div className='d-flex flex-row'>
                        <div className='step-index-container'>{currentStep > index ? <img src={checkmark} /> : index + 1}</div>
                        <p className='title mb-0'>{step.title}</p>
                    </div>
                    <p className='subtitle mb-0'>{step.subtitle}</p>
                </div>
            ))}
        </div>
    );
};

export default Steps;
