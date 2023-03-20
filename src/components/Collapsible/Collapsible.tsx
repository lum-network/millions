import React, { useEffect, useRef, useState } from 'react';
import { Collapse } from 'bootstrap';

import Assets from 'assets';

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
        <div onClick={() => onToggle(!isShowing)} className={`faq-collapsible ${border ? 'with-border' : ''} ${className}`}>
            <div className='faq-collapsible-title'>
                {title}
                <div className={`collapsible-btn ${isShowing && 'is-showing'} d-flex`}>
                    <img src={Assets.images.arrow} alt='arrow' />
                </div>
            </div>
            <div className='collapse' ref={collapseRef} id={id}>
                <p className='faq-collapsible-content' dangerouslySetInnerHTML={{ __html: content }} />
            </div>
        </div>
    );
};

export default Collapsible;
