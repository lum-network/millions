import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { en } from 'locales';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

export const resources = {
    en: {
        translation: en,
    },
} as const;

dayjs.extend(relativeTime);

i18n.use(initReactI18next)
    .init({
        fallbackLng: 'en',
        resources,
        nonExplicitSupportedLngs: true,
    })
    .finally(() => null);

export default i18n;
