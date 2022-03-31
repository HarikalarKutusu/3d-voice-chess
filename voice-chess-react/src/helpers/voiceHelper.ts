import { PieceType } from "chess.js";

// chess.js connection
export type PieceColorType = "b" | "w";
export type BoardCellType = { type: PieceType; color: "w" | "b" } | null;
export type BoardType = Array<
  Array<{ type: PieceType; color: "w" | "b" } | null>
>;

// DEFAULT SERVER

// Server root address
export const SERVER_URL_DEFAULT = "http://localhost";
// For each server, define different port?
export const SERVER_PORT_DEFAULT = 4000;

// FUNCTIONS
