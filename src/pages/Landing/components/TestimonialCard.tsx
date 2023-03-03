import React from 'react';
import { Card } from 'components';
import { LandingConstants } from 'constant';

interface IProps {
    testimonial: LandingConstants.Testimonial;
}

const TestimonialCard = ({ testimonial }: IProps) => {
    const { image, author, quote, network } = testimonial;
    return (
        <Card withoutPadding className='testimonial-card p-5'>
            <img src={image} alt={author} />
            <div className='mt-5 d-flex flex-column align-items-center'>
                <span className='author'>{author}</span>
                <div className='network mt-3'>{network}</div>
                <div className='quote mt-4'>
                    <span className='symbol first'>“</span>
                    <div>{quote}</div>
                    <span className='symbol second'>“</span>
                </div>
            </div>
        </Card>
    );
};

export default TestimonialCard;
