import intl from "react-intl-universal";
import { PieceType } from "chess.js";

export type LanguageCodesType = "de" | "en" | "tr";
export const LANGUAGES: LanguageCodesType[] = ["de", "en", "tr"];
export const DEFAULT_LANGUAGE: LanguageCodesType = "en";

//================================
// Voice Languages
//================================

// Short list to be used in selector
export type LanguageListType = {
  code: LanguageCodesType;
  nativeName: string;
};

// Extended list including everthing needed for STT
export type VoiceLanguageType = {
  code: LanguageCodesType;
  name: string;
  nativeName: string;
  enabled: number;
  pieceNames: string[];
  pieceCodes: PieceType[];
  rowNames: string[];
  colNames: string[];
  sentences: string[];
  intents: string[];
};

// This is the real content
export const VOICE_LANGUAGES: VoiceLanguageType[] = [
  require("./../locales/de/de.json"),
  require("./../locales/en/en.json"),
  require("./../locales/tr/tr.json"),
];

// Some may be manually disabled, so only get enabled ones
export const getEnabledVoiceLanguages = () => {
  return VOICE_LANGUAGES.filter((rec) => rec.enabled === 1);
};

// Get a single record (e.g. current language)
export const getVoiceLanguage = (langCode: LanguageCodesType) => {
  return VOICE_LANGUAGES.find((rec) => rec.code === langCode)!;
};

// Get a list for language selector {code, nativeName}
export const getLanguageList = () => {
  const res: LanguageListType[] = [];
  VOICE_LANGUAGES.forEach((rec) => {
    if (rec.enabled === 1)
      res.push({ code: rec.code, nativeName: rec.nativeName });
  });
  return res;
};

//================================
// i18n by react-intl-universal
//================================

// common locale data
require("intl/locale-data/jsonp/de");
require("intl/locale-data/jsonp/en");
require("intl/locale-data/jsonp/tr");

// app locale data (translated strings)
export const LOCALES = {
  de: require("./../locales/de/messages.json"),
  en: require("./../locales/en/messages.json"),
  tr: require("./../locales/tr/messages.json"),
};

// Initialize - returns the selected default language
export const intlInit = (reqLocale?: LanguageCodesType) => {
  let resLang: string = DEFAULT_LANGUAGE; // assume default
  if (!reqLocale) { // No specific locale requested, decide from browser and/or default
    // try user’s browser language
    const browserLang: string = navigator.language.split(/[-_]/)[0];
    // check if available, if not choose default
    resLang = browserLang in LANGUAGES ? browserLang : DEFAULT_LANGUAGE;
  } else { // 
    resLang = reqLocale;
  }
  //
  console.log("INIT-INLT=", resLang);
  // returns a promise
  return intl.init({
    currentLocale: resLang,
    fallbackLocale: DEFAULT_LANGUAGE,
    locales: LOCALES,
  });
};

export const onLanguageChange = () => {};
