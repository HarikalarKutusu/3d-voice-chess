import { PieceType } from "chess.js";

export type VoiceLanguageType = {
  code: string;
  name: string;
  nativeName: string;
  enabled: boolean;
  pieceNames: string[];
  pieceCodes: PieceType[];
  rowNames: string[];
  colNames: string[];
  sentences: string[];
  intents: string[];
};

//const de: VoiceLanguageType = require("./../locales/de/de.json")
//const en: VoiceLanguageType = require("./../locales/en/en.json")
//const tr: VoiceLanguageType = require("./../locales/tr/tr.json")

export const VOICE_LANGUAGES = [
  require("./../locales/de/de.json"),
  require("./../locales/en/en.json"),
  require("./../locales/tr/tr.json")
]
