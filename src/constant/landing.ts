import Assets from 'assets';

export type Testimonial = {
    author: string;
    image: string;
    quote: string;
    network: string;
};

export const TESTIMONIALS: Testimonial[] = [
    {
        author: 'Ethan Buchman',
        image: Assets.testimonials.ethan,
        quote: 'Great product for the cosmos ecosytem. Easy to use. Easy to win. Future of stackings',
        network: 'Informal Systems',
    },
    {
        author: 'Zaki Manian',
        image: Assets.testimonials.zaki,
        quote: 'Great product for the cosmos ecosytem. Easy to use. Easy to win. Future of stackings',
        network: 'Sommelier Finance',
    },
    {
        author: 'Chjango Unchained',
        image: Assets.testimonials.chjango,
        quote: 'Great product for the cosmos ecosytem. Easy to use. Easy to win. Future of stackings',
        network: 'Interchain FM',
    },
    {
        author: 'Sunny Aggarwal',
        image: Assets.testimonials.sunny,
        quote: 'Great product for the cosmos ecosytem. Easy to use. Easy to win. Future of stackings',
        network: 'Osmosis Labs',
    },
];

export const MAX_PHONE_DEVICE_WIDTH = 640;
export const LARGE_SIZE_SCREEN = 1200;
