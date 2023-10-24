import React, { useEffect, useRef } from 'react';
import LottieReact, { Action } from 'lottie-react';
import lottieReact, { AnimationItem } from 'lottie-web';
interface IProps {
    animationData: unknown;
    className?: string;
    model?: string;
    actions?: Action[];
    segments?: [number, number][];
    delay?: number;
}

const Lottie = ({ animationData, className, segments, actions, delay = 500 }: IProps) => {
    const element = useRef<HTMLDivElement>(null);
    const lottieInstance = useRef<AnimationItem | null>(null);

    useEffect(() => {
        if (!segments) {
            return;
        }

        setTimeout(() => {
            if (element.current) {
                if (lottieInstance.current) {
                    lottieInstance.current.destroy();
                }

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

            if (lottieInstance.current && lottieInstance.current.playSegments) {
                lottieInstance.current.playSegments(segments, true);
            }
        }, delay);

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
