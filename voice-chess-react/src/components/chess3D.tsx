//
// CHESS.JS WRAPPER
//

//console.log(chess.move({ from: 'g2', to: 'g3' }));
//console.log(chess.move({ from: 'e7', to: 'e5' }));

// chess.js actions
//
// chess.header("White", "Özden", "Black", "Computer");
// chess.reset();
// console.log(chess.move({ from: "g2", to: "g3" }));
// console.log(chess.move({ from: "e7", to: "e5" }));
// chess.move("e4");
// console.log(chess.moves({ square: "d7" })); // possible moves => destination ['a3', 'a4']
// chess.put({ type: chess.PAWN, color: chess.BLACK }, "b5"); // put piece
// chess.remove("b5"); // remove piece
// chess.undo(); // undo last move

// chess.js query
//
// console.log(chess.ascii());
// console.log(chess.board());
// console.log(chess.game_over());
// console.log(chess.get("a1"));
// console.log(chess.history());
// console.log(chess.in_check());
// console.log(chess.in_checkmate());
// console.log(chess.in_draw());
// console.log(chess.in_stalemate());
// console.log(chess.insufficient_material());
// console.log(chess.pgn());
// console.log(chess.square_color("a1")); // color of square => dark
// console.log(chess.turn()); // who's turn? => w | b

// REACT
import React, { useCallback, useEffect } from "react";

// three
import { Mesh } from "three";
import { ThreeEvent, useThree } from "@react-three/fiber";

// VOICE-CHESS
import {
  PIECECOLOR_WHITE,
  PIECECOLOR_BLACK,
  BOARD_ROWS,
  BOARD_COLS,
  calcPiecePosition,
  convertCoord2Notation,
  convertPosition2Notation,
} from "./../helpers/chessHelper";

import { BoardType } from "./../helpers/voiceHelper";

import { ChessBoard, tileMaterialPossible } from "./chessBoard";

import { Bishop, King, Knight, Pawn, Queen, Rook } from "./pieces";

// Store
import { useStore } from "../stores/vcstore";
import shallow from "zustand/shallow";

// Chess
import { ChessInstance } from "chess.js";
//import * as ChessJS from "chess.js";
//const Chess = typeof ChessJS === "function" ? ChessJS : ChessJS.Chess;

//const Chess = require("chess.js");
//const chess = new Chess();

// DEBUG
// const debugChess3D = false;


//
// Handlers
//
const tilesToReset: Mesh[] = [];

// resets original tile-mesh color (pointerup might be missed)
const cleanerTimer = () => {
  while (tilesToReset.length > 0) {
    const mesh = tilesToReset.pop();
    mesh!.material = mesh?.userData.__savedMaterial;
  }
};

// shows possible moves
const handlePointerDown = (
  e: ThreeEvent<PointerEvent>,
  chess: ChessInstance,
  x: number,
  y: number,
  scene: THREE.Scene,
) => {
  e.stopPropagation();
  // get initial variables from id & position
  // const [ptype, pcolor, pcoordorig] = id.split("-");
  // const [x, y, z] = pos as [number, number, number];
  // console.log(ptype, pcolor, pcoordorig);
  // console.log(x, y, z);
  // get cell notation
  const notation = convertPosition2Notation(x, y);
  // debugChess3D && console.log(notation);
  // find possible moves for piece
  const moves = chess.moves({ square: notation }) as string[];
  // debugChess3D && console.log(moves);
  // highlight those cells
  if (moves.length > 0) {
    moves.forEach((move: string) => {
      let coord = move.slice(-2); // may be 3 chars like Nf3
      // console.log(coord);
      const tileMesh = scene.getObjectByName(coord) as Mesh;
      if (tileMesh) {
        // console.log(tileMesh);
        tilesToReset.push(tileMesh);
        tileMesh.userData = { __savedMaterial: tileMesh.material };
        tileMesh.material = tileMaterialPossible;
        // mat.color = new Color(tileColorHover);
        // console.log(mat.color);
      }
    });
    setTimeout(cleanerTimer, 3000);
  }
};

// reset to original tile color
const handlePointerUp = () => {
  while (tilesToReset.length > 0) {
    const mesh = tilesToReset.pop();
    mesh!.material = mesh?.userData.__savedMaterial;
  }
};

// reset to original tile color
/*
const handlePointerMove = () => {
  console.log("MOVING");
};
*/

const Piece3D = (props: {
  row: number;
  col: number;
  //ref: React.ForwardedRef<JSX.Element>;
}) => {
  // state
  //const [hovered, setHover] = useState(false);
  // store
  //const { chess } = useStore();
  const { chess } = useStore((state) => ({ chess: state.chess }), shallow);
  // props
  const { col, row } = props;
  // get THREE objects
  const { scene } = useThree();
  //ref
  //const ref=useRef();
  //
  if (chess === undefined) return null;
  const board = chess.board();
  const cell = board[row][col];
  if (cell === null) return null;
  const ptype = cell.type;
  const pcolor = cell.color;
  const pieceColor = pcolor === "b" ? PIECECOLOR_BLACK : PIECECOLOR_WHITE;
  const pos = calcPiecePosition(7 - row, col);
  //const ref=createRef<JSX.Element>();
  let piece = <></>;
  switch (ptype) {
    case "b": // Bishop
      piece = (
        <Bishop
          //key={id}
          //ref={ref}
          color={pieceColor}
          position={pos}
          onPointerDown={(e) => {
            handlePointerDown(e, chess, pos[0], pos[1], scene);
          }}
          onPointerUp={(e) => {
            handlePointerUp();
          }}
          /*
          onPointerMove={(e) => {
            handlePointerMove();
          }}
          onPointerOver={(e) => {
            setHover(true);
          }}
          onPointerOut={(e) => {
            setHover(false);
          }}
          */
        />
      );
      break;
    case "k": // King
      piece = (
        <King
          //key={id}
          //ref={ref}
          color={pieceColor}
          position={pos}
          onPointerDown={(e) => {
            handlePointerDown(e, chess, pos[0], pos[1], scene);
          }}
          onPointerUp={(e) => {
            handlePointerUp();
          }}
        />
      );
      break;
    case "n": // kNight
      piece = (
        <Knight
          //key={id}
          //ref={ref}
          color={pieceColor}
          position={pos}
          onPointerDown={(e) => {
            handlePointerDown(e, chess, pos[0], pos[1], scene);
          }}
          onPointerUp={(e) => {
            handlePointerUp();
          }}
        />
      );
      break;
    case "p": // Pawn
      piece = (
        <Pawn
          //key={id}
          //ref={ref}
          color={pieceColor}
          position={pos}
          onPointerDown={(e) => {
            handlePointerDown(e, chess, pos[0], pos[1], scene);
          }}
          onPointerUp={(e) => {
            handlePointerUp();
          }}
        />
      );
      break;
    case "q": // queen
      piece = (
        <Queen
          //key={id}
          //ref={ref}
          color={pieceColor}
          position={pos}
          onPointerDown={(e) => {
            handlePointerDown(e, chess, pos[0], pos[1], scene);
          }}
          onPointerUp={(e) => {
            handlePointerUp();
          }}
        />
      );
      break;
    case "r": // Rook
      piece = (
        <Rook
          //key={id}
          //ref={ref}
          color={pieceColor}
          position={pos}
          onPointerDown={(e) => {
            handlePointerDown(e, chess, pos[0], pos[1], scene);
          }}
          onPointerUp={(e) => {
            handlePointerUp();
          }}
        />
      );
      break;
    default:
      console.error("ERROR: UNDEFINED PIECE");
  } // switch

  return <>{piece as JSX.Element}</>;
};

const Chess3D = () => {
  // state
  // const [chess, setChess] = useState<ChessInstance>(new Chess());
  // store
  //const {chess, setChess} = useStore(new Chess() as ChessInstance);
  const { chess } = useStore();
  //const { chess } = useStore((state) => ({ chess: state.chess }), shallow);
  //const { setChess } = useStore();
  //const { pieces3D, setPieces3D } = useStore();

  // debugChess3D && console.log("Chess3D - MAIN");

  //const handleMove = () => {};
  //const boardRef = useRef();

  //
  // Create all pieces from chess.js board
  //
  const Pieces3D = useCallback(() => {
    // debugChess3D && console.log("Chess3D - Pieces3D");
    let pieces: JSX.Element[] | undefined = [];
    if (chess !== undefined) {
      // debugChess3D && console.log("Chess3D - Pieces3D - ACTUAL CREATION");
      const board = chess.board() as BoardType;
      for (let row = BOARD_ROWS - 1; row >= 0; row--) {
        for (let col = 0; col < BOARD_COLS; col++) {
          const cell = board[row][col];
          if (cell) {
            const color = cell.color;
            const type = cell.type;
            const id =
              color + "-" + type + "-" + convertCoord2Notation(7 - row, col);
            //const ref = React.createRef<JSX.Element>();
            // debugChess3D && console.log("Pieces3D - id=", id);
            const piece = (
              <Piece3D key={id} col={col} row={row} />
            ) as JSX.Element;
            // pieces.push(<Piece3D key={id} ref={ref} col={col} row={row} />);
            pieces.push(piece);
          }
        }
      }
      // debugChess3D && console.log("Pieces3D - built:", pieces);
    } else {
      // debugChess3D && console.log("Pieces3D - no chess yet", pieces);
    }
    return <>{pieces}</>;
  }, [chess]);

  useEffect(() => {
    // debugChess3D && console.log("Chess3D - useEffect");
  }, []);

  return (
    <>
      <ChessBoard key="board" />
      <Pieces3D key="pieces" />
    </>
  );
};

export { Chess3D };
