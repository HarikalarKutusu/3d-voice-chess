import create from "zustand";
//import { PieceColorType } from "./../helpers/voiceHelper";
import { LanguageCodesType, DEFAULT_LANGUAGE } from "./../helpers/localeHelper";

import { ChessInstance } from "chess.js";
import * as ChessJS from "chess.js";
const Chess = typeof ChessJS === "function" ? ChessJS : ChessJS.Chess;

//type PlayerColor = "b" | "w";

export type StoreType = {
  // language
  langCode: LanguageCodesType;
  setLangCode: (langCode: LanguageCodesType) => void;
  // STT
  lastRecognition: string; // STT recognized sentence to be validated
  setLastRecognition: (lastRecognition: string) => void;
  lastError: string; // Any error feedback from Audio & Network processes
  setLastError: (lastError: string) => void;
  // Chess
  chess: ChessInstance;
  setChess: (chess: ChessInstance) => void;
  // turnColor: PieceColorType;
  // setTurnColor: (playerColor: PieceColorType) => void;
  // Chess Timing
  // playerTimes: string;
  // setPlayerTimes: (color: PlayerColor, time: string) => void;
};

const useStore = create<StoreType>((set) => ({
  // language
  langCode: DEFAULT_LANGUAGE,
  setLangCode: (langCode) => set((state) => ({ ...state, langCode: langCode })),

  // STT
  lastRecognition: "",
  setLastRecognition: (lastRecognition) =>
    set((state) => ({ ...state, lastRecognition: lastRecognition, lastError: "" })),
  lastError: "",
  setLastError: (lastError) =>
    set((state) => ({ ...state, lastError: lastError })),

  // Chess
  chess: new Chess(),
  setChess: (chess) => set((state) => ({ ...state, chess: chess })),
  // turnColor: "w",
  // setTurnColor: (playerColor) =>
  //   set((state) => ({ ...state, turnColor: playerColor })),

  // Chess Timing

}));

export { useStore };
