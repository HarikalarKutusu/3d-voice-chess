import { PieceType } from "chess.js";

// chess.js connection
export type PieceColorType = "b" | "w";
export type BoardCellType = { type: PieceType; color: "w" | "b" } | null;
export type BoardType = Array<
  Array<{ type: PieceType; color: "w" | "b" } | null>
>;

// TYPES

export enum PieceEnum {
  King,
  Queen,
  Rook,
  Bishop,
  Knight,
  Pawn,
}

export type PieceNamesType = {
  piece: PieceEnum;
  nativeName: string;
};

export type VoiceLanguageType = {
  code: string;
  name: string;
  nativeName: string;
  enabled: boolean;
  pieces: PieceNamesType[];
  rowNames: string[];
  colNames: string[];
  sentences: string[];
  intent: string[];
};

/* 
interface IMove {
  id: number;
  player: "w" | "b";
  piece: PieceEnum;
  fromCoord: string;
  toCoord: string;
}
*/

// CONSTANTS
export const PIECE_NAMES_SHORT = ["K", "Q", "R", "B", "N", "P"];
export const PIECE_NAMES_LONG = [
  "King",
  "Queen",
  "Rook",
  "Bishop",
  "Knight",
  "Pawn",
];

export const VOICE_LANGUAGES: VoiceLanguageType[] = [
  {
    code: "de",
    name: "German",
    nativeName: "Deutsch",
    enabled: true,
    pieces: [
      { piece: PieceEnum.King, nativeName: "koenig" },
      { piece: PieceEnum.Queen, nativeName: "dame" },
      { piece: PieceEnum.Rook, nativeName: "turm" },
      { piece: PieceEnum.Bishop, nativeName: "laeufer" },
      { piece: PieceEnum.Knight, nativeName: "springer" },
      { piece: PieceEnum.Pawn, nativeName: "bauer" },
    ],
    rowNames: [
      "eins",
      "zwei",
      "drei",
      "vier",
      "fuenf",
      "sechs",
      "sieben",
      "acht",
    ],
    colNames: [
      "alpha",
      "bravo",
      "charlie",
      "delta",
      "echo",
      "foxtrot",
      "golf",
      "hotel",
    ],
    sentences: [
      "{piece} zieht von {fromCol}{fromRow} nach {toCol}{toRow}|pft",
      "zieh {fromCol}{fromRow} nach {toCol}{toRow}|ft",
      "{piece} auf {fromCol}{fromRow} zieht nach {toCol}{toRow}|pft",
      "{piece} auf {fromCol}{fromRow} nach {toCol}{toRow}|pft",
      "{piece} {fromCol}{fromRow} zieht nach {toCol}{toRow}|pft",
      "{piece} {fromCol}{fromRow} nach {toCol}{toRow}|pft",
      "zieh {piece} nach {toCol}{toRow}|pt",
      "{piece} zieht nach {toCol}{toRow}|pt",
      "{piece} nach {toCol}{toRow}|pt",
      "{fromCol}{fromRow} {toCol}{toRow}|ft",
      "{toCol}{toRow}|t",
      "weisse {piece} zieht nach {toCol}{toRow}|pt",
      "weisse {piece} nach {toCol}{toRow}|pt",
      "schwarze {piece} zieht nach {toCol}{toRow}|pt",
      "schwarze {piece} nach {toCol}{toRow}|pt",
      "{piece} {fromCol}{fromRow} schlaegt {toCol}{toRow}|pft",
      "{piece} schlaegt {toCol}{toRow}|pt",
      "{piece} auf {fromCol}{fromRow} schlaegt {piece}|pft",
      "{piece} schlaegt {piece}|pp",
      "{piece} schlaegt {piece} auf {toCol}{toRow}|ppt",
      "schlaegt {toCol}{toRow}|t",
      "Bauernumwandlung zur {piece}|p",
      "Bauernumwandlung zum {piece}|p",
      "ich gebe auf|_resign",
      "schwarz gibt auf|_resign",
      "weiss gibt auf|_resign",
      "schach|_x",
      "matt|_x",
      "patt|_x",
      "rochade am koenigsfluegel|_castling1",
      "rochade am damenfluegel|_castling2",
      "koenigsfluegel rochade|_castling1",
      "damenfluegel rochade|_castling2",
      "rueckgehen|!undo",
      "bewegung rueckgaengig machen|!undo",
      "zuruecknehmen|!undo",
      "nehme zurueck|!undo",
      "zurueckbringen|!undo",
      "schwarz spielen|!play_black",
      "weiss spielen|!play_white",
      "zuruecksetzen!reset",
      "spiel zuruecksetzen!reset",
      "spiel beenden|!finish",
      "spiel wiederholen|!replay",
    ],
    intent: [],
  },
  {
    code: "en",
    name: "English",
    nativeName: "English",
    enabled: true,
    pieces: [
      { piece: PieceEnum.King, nativeName: "king" },
      { piece: PieceEnum.Queen, nativeName: "queen" },
      { piece: PieceEnum.Rook, nativeName: "rook" },
      { piece: PieceEnum.Rook, nativeName: "castle" },
      { piece: PieceEnum.Bishop, nativeName: "bishop" },
      { piece: PieceEnum.Knight, nativeName: "knight" },
      { piece: PieceEnum.Pawn, nativeName: "pawn" },
    ],
    rowNames: ["one", "two", "three", "four", "five", "six", "seven", "eight"],
    colNames: [
      "alpha",
      "bravo",
      "charlie",
      "delta",
      "echo",
      "foxtrot",
      "golf",
      "hotel",
    ],
    sentences: [
      "move {piece} from {fromCol}{fromRow} to {toCol}{toRow}|pft",
      "move {fromCol}{fromRow} to {toCol}{toRow}|ft",
      "{piece} at {fromCol}{fromRow} to {toCol}{toRow}|pft",
      "{piece} moves to {toCol}{toRow}|pt",
      "{piece} to {toCol}{toRow}|pt",
      "{fromCol}{fromRow} {toCol}{toRow}|ft",
      "{toCol}{toRow}|t",
      "white {piece} to {toCol}{toRow}|pt",
      "black {piece} to {toCol}{toRow}|pt",
      "{piece} {fromCol}{fromRow} takes {toCol}{toRow}|pft",
      "{piece} {fromCol}{fromRow} captures {toCol}{toRow}|pft",
      "{piece} takes {toCol}{toRow}|pt",
      "{piece} captures {toCol}{toRow}|pt",
      "{piece} at {fromCol}{fromRow} takes {piece}|pfp",
      "{piece} at {fromCol}{fromRow} captures {piece}|pfp",
      "{piece} takes {piece}|pp",
      "{piece} captures {piece}|pp",
      "{piece} takes {piece} at {toCol}{toRow}|ppt",
      "{piece} captures {piece} at {toCol}{toRow}|ppt",
      "take {toCol}{toRow}|t",
      "capture {toCol}{toRow}|t",
      "promote to {piece}|p",
        
      "i resign|_resign",
      "black resigns|_resign",
      "white resigns|_resign",
      "check|_x",
      "checkmate|_x",
      "stalemate|_x",
      "kingside castle|_castling1",
      "queenside castle|_castling2",
      "kingside castling|_castling1",
      "queenside castling|_castling2",

      "undo|!undo",
      "undo move|!undo",
      "take back|!undo",
      "play black|!play_black",
      "play white|!play_white",
      "reset game|!reset",
      "finish game|!finish",
      "replay game|!replay",
    ],
    intent: [],
  },
  {
    code: "fr",
    name: "French",
    nativeName: "Français",
    enabled: false,
    pieces: [
      { piece: PieceEnum.King, nativeName: "le Roi" },
      { piece: PieceEnum.Queen, nativeName: "la Dame" },
      { piece: PieceEnum.Rook, nativeName: "la Tour" },
      { piece: PieceEnum.Bishop, nativeName: "le Fou" },
      { piece: PieceEnum.Knight, nativeName: "le Cavalier" },
      { piece: PieceEnum.Pawn, nativeName: "le Pion" },
    ],
    rowNames: ["Un", "Deux", "Trois", "Quatre", "Cinq", "Six", "Sept", "Huit"],
    colNames: [
      "Alpha",
      "Bravo",
      "Charlie",
      "Delta",
      "Echo",
      "Foxtrot",
      "Golf",
      "Hotel",
    ],
    sentences: ["Déplacer {piece} de {fromCoord} à {toCoord}"],
    intent: [],
  },
  {
    code: "hi",
    name: "Hindi",
    nativeName: "हिन्दी",
    enabled: false,
    pieces: [
      { piece: PieceEnum.King, nativeName: "राजा" },
      { piece: PieceEnum.Queen, nativeName: "वज़ीर" },
      { piece: PieceEnum.Queen, nativeName: "रानी" },
      { piece: PieceEnum.Rook, nativeName: "हाथी" },
      { piece: PieceEnum.Bishop, nativeName: "ऊँट" },
      { piece: PieceEnum.Knight, nativeName: "घोड़ा" },
      { piece: PieceEnum.Pawn, nativeName: "प्यादा" },
    ],
    rowNames: ["एक", "दो", "तीन", "चार", "पांच", "छः", "सात", "आठ"],
    colNames: [
      "Alpha",
      "Bravo",
      "Charlie",
      "Delta",
      "Echo",
      "Foxtrot",
      "Golf",
      "Hotel",
    ],
    sentences: ["{piece} को {fromCoord} से {toCoord} तक ले जाओ"],
    intent: [],
  },
  {
    code: "ru",
    name: "Russian",
    nativeName: "русский",
    enabled: false,
    pieces: [
      { piece: PieceEnum.King, nativeName: "король" },
      { piece: PieceEnum.Queen, nativeName: "ферзь" },
      { piece: PieceEnum.Queen, nativeName: "королева" },
      { piece: PieceEnum.Rook, nativeName: "ладья" },
      { piece: PieceEnum.Bishop, nativeName: "слон" },
      { piece: PieceEnum.Knight, nativeName: "конь" },
      { piece: PieceEnum.Pawn, nativeName: "пешка" },
    ],
    rowNames: [
      "Раз",
      "Два",
      "Три",
      "Четыре",
      "Пять",
      "Шесть",
      "Семь",
      "Восемь",
    ],
    colNames: [
      "Alpha",
      "Bravo",
      "Charlie",
      "Delta",
      "Echo",
      "Foxtrot",
      "Golf",
      "Hotel",
    ],
    sentences: ["Переместить {piece} из {fromCoord} в {toCoord}"],
    intent: [],
  },
  {
    code: "tr",
    name: "Turkish",
    nativeName: "Türkçe",
    enabled: true,
    pieces: [
      { piece: PieceEnum.King, nativeName: "şah" },
      { piece: PieceEnum.Queen, nativeName: "vezir" },
      { piece: PieceEnum.Rook, nativeName: "kale" },
      { piece: PieceEnum.Bishop, nativeName: "fil" },
      { piece: PieceEnum.Knight, nativeName: "at" },
      { piece: PieceEnum.Pawn, nativeName: "piyon" },
    ],
    rowNames: ["bir", "iki", "üç", "dört", "beş", "altı", "yedi", "sekiz"],
    colNames: [
      "alpha",
      "bravo",
      "charlie",
      "delta",
      "echo",
      "foxtrot",
      "golf",
      "hotel",
    ],
    sentences: [
      "{piece} {fromCol}{fromRow}{fromSuffix} {toCol}{toRow}{toSuffix} gider|pft",
      "{piece} {fromCol}{fromRow}{fromSuffix} {toCol}{toRow}{toSuffix}|pft",
      "{piece} {toCol}{toRow}{toSuffix}|pt",
      "{fromCol}{fromRow}{fromSuffix} {toCol}{toRow}{toSuffix}|ft",
      "{fromCol}{fromRow}{atSuffix} {piece} {toCol}{toRow}{toSuffix} gider|pft",
      "{fromCol}{fromRow}{atSuffix} {piece} {toCol}{toRow}{toSuffix}|pft",
      "{piece} {toCol}{toRow}{toSuffix} gider|pt",
      "{piece}{pieceSuffix} {toCol}{toRow}{toSuffix} götür|pt",
      "{piece} {toCol}{toRow}{toSuffix}|pt",
      "{fromCol}{fromRow} {toCol}{toRow}|ft",
      "{toCol}{toRow}|t",
      "Beyaz {piece} {toCol}{toRow}{toSuffix} gider|pt",
      "Siyah {piece} {toCol}{toRow}{toSuffix} gider|pt",
      "Beyaz {piece} {toCol}{toRow}{toSuffix}|pt",
      "Siyah {piece} {toCol}{toRow}{toSuffix}|pt",
      "{fromCol}{fromRow}{atSuffix} {piece} {toCol}{toRow}{toSuffix}|pft",
      "{fromCol}{fromRow}{atSuffix} {piece} {toCol}{toRow}{towardsSuffix} alır|pft",
      "{piece} {fromCol}{fromRow}{fromSuffix} {toCol}{toRow}{towardsSuffix} alır|pft",
      "{piece} {toCol}{toRow}{towardsSuffix} alır|pt",
      "{piece} {piece}{pieceSuffix} alır|pp",
      "{piece} {toCol}{toRow}{atSuffix} {piece}{pieceSuffix} alır|pft",
      "{toCol}{toRow}{towardsSuffix} al|t",
      "{piece}{pieceToSuffix} yükselt|p",
      "{piece}{pieceToSuffix} terfi ettir|p",
      "{piece} yap|p",
      "Çekiliyorum|_resign",
      "Terk ediyorum|_resign",
      "Siyah terk eder|_resign",
      "Beyaz terk eder|_resign",
      "Şah|_x",
      "Şah mat|_x",
      "Beraberlik|_x",
      "Pat|_x",
      "Şah kanadı rok|_castling1",
      "Vezir kanadı rok|_castling2",
      "Siyah oyna|!play_black",
      "Beyaz oyna|!play_white",
      "Geri al|!undo",
      "İptal|!undo",
      "Oyunu sıfırla|!reset",
      "Oyunu bitir|!finish",
      "Yeniden oynat|!replay",
    ],
    intent: [],
  },
];

// GLOBALS

export const VOICE_DEFAULT_LANGUAGE = "";

// DEFAULT SERVER

// Server root address
export const SERVER_URL_DEFAULT = "http://localhost";
// For each server, define different port?
export const SERVER_PORT_DEFAULT = 4000;

// FUNCTIONS
