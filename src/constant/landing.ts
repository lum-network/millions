import ethan from 'assets/images/testimonials/ethan.png';
import zaki from 'assets/images/testimonials/zaki.png';
import chjango from 'assets/images/testimonials/chjango.png';
import sunny from 'assets/images/testimonials/sunny.png';

export type Testimonial = {
    author: string;
    image: string;
    quote: string;
    network: string;
};

export const TESTIMONIALS: Testimonial[] = [
    {
        author: 'Ethan Buchman',
        image: ethan,
        quote: 'Great product for the cosmos ecosytem. Easy to use. Easy to win. Future of stackings',
        network: 'Informal Systems',
    },
    {
        author: 'Zaki Manian',
        image: zaki,
        quote: 'Great product for the cosmos ecosytem. Easy to use. Easy to win. Future of stackings',
        network: 'Sommelier Finance',
    },
    {
        author: 'Chjango Unchained',
        image: chjango,
        quote: 'Great product for the cosmos ecosytem. Easy to use. Easy to win. Future of stackings',
        network: 'Interchain FM',
    },
    {
        author: 'Sunny Aggarwal',
        image: sunny,
        quote: 'Great product for the cosmos ecosytem. Easy to use. Easy to win. Future of stackings',
        network: 'Osmosis Labs',
    },
];
