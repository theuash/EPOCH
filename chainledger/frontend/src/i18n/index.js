import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en';
import kn from './kn';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en,
      kn
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
