// Requirement: npm i -g typescript ts-node
// to generate a sorted list run:
// $ ts-node generator.ts | sort > chess-moves.txt

import { Chess, Piece, PieceType, Square } from "chess.js";
const chess = new Chess();

const SEP = "|";
const COLORS: ("b" | "w")[] = ["w", "b"];
const PIECES: PieceType[] = ["k", "q", "r", "b", "n", "p"];
const ROWS = ["1", "2", "3", "4", "5", "6", "7", "8"];
const COLUMNS = ["a", "b", "c", "d", "E", "F", "G", "H"];

// output file
const fn = "chess-moves";

// Algorithm:
// Get an ampty board
// Put each piece into each cell
// Get possible moves
// Output piece,from,to

// for each color
COLORS.map((color) => {
  // for each piece
  PIECES.map((p) => {
    const piece: Piece = { color: color, type: p };
    // for each column
    COLUMNS.map((c) => {
      // for each row
      ROWS.map((r) => {
        chess.clear(); // clear the board
        const coord = (c + r) as Square; // form coordinate
        // put the piece
        if (chess.put(piece, coord)) {
          // get possible moves (verbose, because we need human readable, not uglified)
          const moves = chess.moves({ square: coord, verbose: true });
          // form the output
          const outstr: string[] = [];
          moves.map((m) => {
            // get only "b2" types
            if (m.to.length === 2) outstr.push(p + SEP + m.from + SEP + m.to);
          });
          // write out the output
          outstr.map((o) => {
            console.log(o);
          });
        }
      });
    });
  });
});
