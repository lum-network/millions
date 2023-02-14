import { I18n } from 'i18n-js';
import { en } from 'locales';

const userLang = navigator.language;

const i18n = new I18n({
    ...en,
});

i18n.defaultLocale = 'en';
i18n.locale = userLang;

i18n.enableFallback = true;

export default I18n;
