import confetti from 'canvas-confetti';

const colors = ['#C2E1FE', '#FFCB54', '#FEC6FC', '#FDAB9F'];

export const confettis = (duration = 10000) => {
    const interval = setInterval(() => {
        confetti({
            particleCount: 4,
            angle: 60,
            spread: 60,
            origin: { x: -0.1 },
            colors: colors,
            ticks: 300,
            scalar: 2,
        });
        confetti({
            particleCount: 4,
            angle: 120,
            spread: 60,
            origin: { x: 1.1 },
            colors: colors,
            ticks: 300,
            scalar: 2,
        });
    }, 100);

    setTimeout(() => {
        clearInterval(interval);
    }, duration);
};
