import * as Localization from 'expo-localization';
import i18n from 'i18n-js';

import en from './locales/en.json';
import ar from './locales/ar.json';

i18n.translations = { en, ar };

const locales = Localization.locale || 'en';

if (locales.startsWith('ar')) {
  i18n.locale = 'ar';
} else {
  i18n.locale = 'en';
}

i18n.fallbacks = true;

export default i18n;
