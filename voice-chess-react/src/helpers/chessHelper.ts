// board
export const BOARD_ROWS = 8;
export const BOARD_COLS = 8;
export const TILESIZE = 1.0;
export const TILEDEPTH = 0.2;
export const TILECOLOR_WHITE = "#f0f0f0";
export const TILECOLOR_BLACK = "#303030";
export const TILECOLOR_HOVER = "#00FFFF";
export const TILECOLOR_POSSIBLE = "#33FF33";

export const BOARD_ROWNAMES = ["1", "2", "3", "4", "5", "6", "7", "8"];
export const BOARD_COLNAMES = ["A", "B", "C", "D", "E", "F", "G", "H"];
export const BOARD_COLNAMES_LONG = ["Alpha", "Bravo", "Charlie", "Delta", "Echo", "Foxtrot", "Golf", "Hotel"];
export const BOARD_LABELSCALE = 0.04;

// pieces
export const PIECE_URLPREFIX = "assets/models/";

export const PIECECOLOR_WHITE = "#ffc";
export const PIECECOLOR_BLACK = "#222";
export const PIECECOLOR_HOVERED = "#0FF";
export const PIECECOLOR_IMPOSSIBLE = "#F66";


// Calculations

export const calcTilePosition = (row: number, col: number) => {
  const x = col * TILESIZE + TILESIZE / 2;
  const y = row * TILESIZE + TILESIZE / 2;
  const z = -TILEDEPTH / 2;
  return [x, y, z] as [number, number, number];
};

export const calcPiecePosition = (row: number, col: number) => {
  const x = col * TILESIZE + TILESIZE / 2;
  const y = row * TILESIZE + TILESIZE / 2;
  const z = 0;
  return [x, y, z] as [number, number, number];
};

export const convertCoord2Notation = (row: number, col: number) => {
  const notation = BOARD_COLNAMES[col].toLowerCase() + BOARD_ROWNAMES[row];
  return notation;
};

export const convertArrCoord2Notation = (row: number, col: number) => {
  return convertCoord2Notation(7- row, col);
};

export const convertNotation2Coord = (notation: string) => {
  const colStr = notation.charAt(0).toLowerCase();
  const rowStr = notation.charAt(1).toLowerCase();
  const col = colStr.charCodeAt(0) - "a".charCodeAt(0);
  const row = rowStr.charCodeAt(0) - "1".charCodeAt(0);
  return { row, col };
};

export const convertPosition2Notation = (x: number, y: number) => {
  const col = Math.round((x - TILESIZE / 2) / TILESIZE);
  const row = Math.round((y - TILESIZE / 2) / TILESIZE);
  return convertCoord2Notation(row, col);
};

export const convertPosition2Coord = (x: number, y: number) => {
  const col = Math.round((x - TILESIZE / 2) / TILESIZE);
  const row = Math.round((y - TILESIZE / 2) / TILESIZE);
  return calcPiecePosition(row, col);
};
