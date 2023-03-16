import React, { useEffect, useRef, useState } from 'react';
import { Collapse } from 'bootstrap';

import './Collapsible.scss';

interface Props {
    title: string;
    content: string;
    id: string;
    className?: string;
    border?: boolean;
}

const Collapsible = (props: Props) => {
    const [isShowing, setIsShowing] = useState(false);
    const [bsCollapse, setBsCollapse] = useState<Collapse>();
    const collapseRef = useRef<HTMLDivElement>(null);

    const { title, content, id, className, border = true } = props;

    useEffect(() => {
        const collapsible = document.getElementById(id);

        if (collapsible) {
            setBsCollapse(new Collapse(collapsible, { toggle: false }));

            collapsible.addEventListener('hide.bs.collapse', () => {
                setIsShowing(false);
            });
            collapsible.addEventListener('show.bs.collapse', () => {
                setIsShowing(true);
            });
        }
    }, []);

    const onToggle = (show: boolean) => {
        if (show) {
            bsCollapse?.show();
        } else {
            bsCollapse?.hide();
        }
    };

    return (
        <div className={`faq-collapsible ${border ? 'with-border' : ''} ${className}`}>
            <button
                type='button'
                onClick={() => onToggle(!isShowing)}
                className='btn-reset w-100 px-0 text-start text-white faq-collapsible-title d-flex flex-row align-items-center justify-content-between mb-3'
            >
                {title}
                <div className={`rounded-circle collapsible-btn ${isShowing && 'is-showing'} d-flex align-items-center justify-content-center ms-2 ms-sm-5`}>
                    <svg width='33' height='33' viewBox='0 0 33 33' fill='none' xmlns='http://www.w3.org/2000/svg'>
                        <path className='horizontal-line' d='M0.00012207 16.5H32.5001' stroke='url(#paint0_linear_727_716)' strokeWidth='4' />
                        <path className='vertical-line' d='M16.2501 32.75L16.2501 0.25' stroke='url(#paint1_linear_727_716)' strokeWidth='4' />
                        <defs>
                            <linearGradient id='paint0_linear_727_716' x1='0.338573' y1='17.3142' x2='27.5577' y2='1.28735' gradientUnits='userSpaceOnUse'>
                                <stop stopColor='#FBCE7E' />
                                <stop offset='1' stopColor='#A88054' />
                            </linearGradient>
                            <linearGradient id='paint1_linear_727_716' x1='17.0643' y1='32.4115' x2='1.03747' y2='5.1924' gradientUnits='userSpaceOnUse'>
                                <stop stopColor='#FBCE7E' />
                                <stop offset='1' stopColor='#A88054' />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
            </button>
            <div className='collapse' ref={collapseRef} id={id}>
                <p className='faq-collapsible-content pb-3' dangerouslySetInnerHTML={{ __html: content }} />
            </div>
        </div>
    );
};

export default Collapsible;
