import React, { useEffect, useRef, useState } from 'react';
import { Collapse } from 'bootstrap';

import Assets from 'assets';

import './Collapsible.scss';
import { I18n } from 'utils';

interface Props {
    header: string | JSX.Element;
    content: string | JSX.Element;
    id: string;
    disabled?: boolean;
    withButton?: boolean;
    toggleWithButton?: boolean;
    className?: string;
    border?: boolean;
    buttonBorder?: boolean;
    onExpand?: () => void;
    onCollapse?: () => void;
}

const Collapsible = (props: Props) => {
    const [isShowing, setIsShowing] = useState(false);
    const [bsCollapse, setBsCollapse] = useState<Collapse>();
    const collapseRef = useRef<HTMLDivElement>(null);

    const { header, content, id, className, toggleWithButton, disabled, border = true, buttonBorder, onCollapse, onExpand } = props;

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
        if (disabled) {
            return;
        }

        if (show) {
            bsCollapse?.show();
            onExpand && onExpand();
        } else {
            bsCollapse?.hide();
            onCollapse && onCollapse();
        }
    };

    return (
        <div
            onClick={toggleWithButton ? undefined : () => onToggle(!isShowing)}
            className={`collapsible ${!toggleWithButton ? 'clickable' : ''} ${border ? 'with-border' : ''} ${isShowing && 'is-showing'}  ${className}`}
        >
            <div className='collapsible-title'>
                {header}
                {!disabled && (
                    <div
                        onClick={toggleWithButton ? () => onToggle(!isShowing) : undefined}
                        className={`collapsible-btn ${isShowing && 'is-showing'} d-flex align-items-center justify-content-center ${buttonBorder ? 'with-button-border' : 'ms-4'}`}
                    >
                        {buttonBorder &&
                            (isShowing ? (
                                <span className='me-3' dangerouslySetInnerHTML={{ __html: I18n.t('collapsible.closeDetails') }} />
                            ) : (
                                <span className='me-3' dangerouslySetInnerHTML={{ __html: I18n.t('collapsible.openDetails') }} />
                            ))}
                        <img src={Assets.images.arrow} alt='arrow' className='purple-filter' />
                    </div>
                )}
            </div>
            <div className='collapse w-100' ref={collapseRef} id={id}>
                {typeof content === 'string' ? <p className='collapsible-content' dangerouslySetInnerHTML={{ __html: content }} /> : content}
            </div>
        </div>
    );
};

export default Collapsible;
