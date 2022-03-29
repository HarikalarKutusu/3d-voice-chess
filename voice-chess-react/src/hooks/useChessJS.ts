import { ChessInstance, Square } from "chess.js";
import { useStore } from "./../stores/vcstore";

export const useChessJSLegalMoves = (coord: Square) => {
  const { chess } = useStore();
  return chess?.moves({ square: coord });
};
