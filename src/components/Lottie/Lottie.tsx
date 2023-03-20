import React, { useEffect, useRef } from 'react';
import LottieReact, { Action } from 'lottie-react';
import lottieReact from 'lottie-web';
interface IProps {
    animationData: unknown;
    className?: string;
    model?: string;
    actions?: Action[];
    segments?: [number, number][];
}

const Lottie = ({ animationData, className, segments, actions }: IProps) => {
    const element = useRef<HTMLDivElement>(null);
    const lottieInstance = useRef<any>();

    useEffect(() => {
        if (!segments) {
            return;
        }

        setTimeout(() => {
            if (element.current) {
                lottieInstance.current?.destroy();
                lottieInstance.current = lottieReact.loadAnimation({
                    container: element.current,
                    renderer: 'svg',
                    loop: true,

                    rendererSettings: {
                        preserveAspectRatio: 'xMidYMid slice',
                    },
                    animationData,
                });
            }

            lottieInstance.current.playSegments(segments, true);
        }, 500);

        return () => {
            lottieInstance.current?.destroy();
            lottieInstance.current = null;
        };
    }, [animationData]);

    if (!segments) {
        return (
            <div className={className}>
                <LottieReact
                    animationData={animationData}
                    interactivity={
                        actions
                            ? {
                                  mode: 'scroll',
                                  actions,
                              }
                            : undefined
                    }
                />
            </div>
        );
    }

    return (
        <div className={className}>
            <div ref={element} />
        </div>
    );
};

export default Lottie;
