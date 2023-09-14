/* eslint-disable @typescript-eslint/no-unused-vars */

// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';

import { gsap } from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { CSSPlugin } from 'gsap/CSSPlugin';

class SplitTextMock {
    readonly chars: Element[] = [];
    readonly lines: Element[] = [];
    readonly words: Element[] = [];
    readonly selector = jest.fn();

    constructor(target: gsap.DOMTarget, vars?: SplitText.Vars) {
        jest.fn();
    }

    revert() {
        jest.fn();
    }

    split(vars: SplitText.Vars) {
        jest.fn();
    }
}

Object.defineProperty(global, 'SplitText', { value: SplitTextMock, writable: true });

gsap.config({ nullTargetWarn: false });
gsap.registerPlugin(MotionPathPlugin, ScrollTrigger, ScrollToPlugin, CustomEase, SplitTextMock, CSSPlugin);

const noop = () => {
    // do nothing
};
Object.defineProperty(window, 'scrollTo', { value: noop, writable: true });

if (typeof global.TextEncoder === 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { TextEncoder } = require('util');
    global.TextEncoder = TextEncoder;
}
