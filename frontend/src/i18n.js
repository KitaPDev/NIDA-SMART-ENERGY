import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import translationEN from "./locales/en/translation.json";
import translationTH from "./locales/th/translation.json";

// translations
const resources = {
	en: {
		translation: translationEN,
	},
	th: {
		translation: translationTH,
	},
};

i18n.use(initReactI18next).init({
	resources,
	lng: i18n.options.lng,
	fallbackLng: "en",

	keySeparator: false,

	interpolation: {
		escapeValue: false,
	},
});

export default i18n;
