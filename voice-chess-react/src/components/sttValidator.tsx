import { useState, useEffect, useCallback, useRef } from "react";
// similarity checker
import {
  BestMatch,
  Rating,
  compareTwoStrings,
  findBestMatch,
} from "string-similarity";

// VOICE-CHESS
import {
  PIECECOLOR_WHITE,
  PIECECOLOR_BLACK,
  BOARD_ROWS,
  BOARD_COLS,
  calcPiecePosition,
  convertCoord2Notation,
  convertPosition2Notation,
  BOARD_COLNAMES,
  BOARD_ROWNAMES,
  convertArrCoord2Notation,
} from "./../helpers/chessHelper";

import {
  PieceColorType,
  BoardCellType,
  BoardType,
  PieceEnum,
  PIECE_NAMES_LONG,
  PIECE_NAMES_SHORT,
  VOICE_LANGUAGES,
  PieceNamesType,
} from "./../helpers/voiceHelper";

// Icons
import { GiChessKing as KingIcon } from "@react-icons/all-files/gi/GiChessKing";
import { GiChessPawn as PawnIcon } from "@react-icons/all-files/gi/GiChessPawn";
import { FaEquals as EqualIcon } from "@react-icons/all-files/fa/FaEquals";

// Store
import { useStore } from "../stores/vcstore";

import "./socketVoice.css";

// Chess
import {
  ChessInstance,
  Piece,
  PieceType,
  Square,
  Move,
  ShortMove,
  Comment,
} from "chess.js";
import * as ChessJS from "chess.js";
const Chess = typeof ChessJS === "function" ? ChessJS : ChessJS.Chess;

// DEBUG
const debugSTTValidator = true;

export type ISTTValidatorProps = {
  sttTxt: string; // default: ""
  errTxt: string; // default: ""
};

//
// Validator Component
//
const STTValidator = (props: ISTTValidatorProps) => {
  // ref
  const isMounted = useRef(true);
  // props
  const { sttTxt, errTxt } = props;
  // state
  const [suggestedMove, setSuggestedMove] = useState("? ?? → ??");
  // store
  const { langCode, setLangCode } = useStore();
  const { chess } = useStore();
  //const { lastRecognition, setLastRecognition } = useStore();
  const { lastError, setLastError } = useStore();

  // local globals
  //const board: BoardType = chess.board();
  const lastSTT: string = sttTxt;
  const iconSize = 24;
  const iconPassiveColor = "#eee";
  const iconActiveColor = "#3cc";
  const iconButtonPassiveColor = "#333";

  //
  // MovePanel Component
  //
  const MovePanel = (props: any) => {
    return (
      <span
        title="Recognized chess move"
        className="svPanelText"
        style={{ width: "60px", minWidth: "60px" }}
      >
        {props.move}
      </span>
    );
  };

  //
  // FeedbackPanel Component
  //
  const FeedbackPanel = (props: any) => {
    return (
      <span
        title="Errors and warnings"
        className="svPanelText"
        style={{ color: "#933" }}
        hidden
      >
        {props.text}
      </span>
    );
  };

  //
  // CurrentPlayer Component
  //
  const CurrentPlayer = (props: any) => {
    return (
      <PawnIcon
        title="Current player"
        className="svIconButtonDisabled"
        size={iconSize}
        color={props.color === "b" ? PIECECOLOR_BLACK : PIECECOLOR_WHITE}
      />
    );
  };

  //
  // Check Component
  //
  const SpecialStatusDisplay = () => {
    return (
      <>
        <KingIcon
          title="In check"
          className="svIconButtonDisabled"
          size={iconSize}
          visibility={chess.in_check() ? "visible" : "hidden"}
          color="#f00"
        />
        <KingIcon
          title="In check-mate"
          className="svIconButtonDisabled"
          size={iconSize}
          transform="rotate(90)"
          visibility={chess.in_checkmate() ? "visible" : "hidden"}
          color="#f00"
        />
        <EqualIcon
          title="In draw/stalemate/3-fold repetition/insufficent material"
          className="svIconButtonDisabled"
          size={iconSize}
          visibility={
            chess.in_stalemate() ||
            chess.in_draw() ||
            chess.in_threefold_repetition() ||
            chess.insufficient_material()
              ? "visible"
              : "hidden"
          }
          color="#f00"
        />
      </>
    );
  };

  //
  // Validator Function
  //
  const sttPostProcess = useCallback(
    (rawText: string) => {
      //
      // Utility Functions
      //
      const clearPanels = () => {
        setSuggestedMove("? ?? → ??");
        setLastError("");
      };

      const showSuggestedMove = (
        p?: PieceType | "?",
        f?: Square | "??",
        t?: Square | "??",
      ) => {
        setSuggestedMove(p + " " + f + "=>" + t);
      };

      const moveError = (err: string) => {
        debugSTTValidator && console.log("MOVE-ERROR:", err);
        setLastError(err);
      };

      const handleMove = (from: Square, to: Square) => {
        // try the actual move, returns move or null
        const move = chess.move({ from: from, to: to });
        if (move) {
          debugSTTValidator && console.log("MOVE-OK:", from, to);
          setLastError(move.san);
        } else {
          moveError("Error in move!");
        }
      };

      // replace all occurrances of a substring
      // const replaceAll = (
      //   str: string,
      //   searchStr: string,
      //   replaceStr: string,
      // ) => {
      //   const searchRegExp = new RegExp(searchStr, "g");
      //   return str.replace(searchRegExp, replaceStr);
      // };

      // Return Language record
      const findLanguageRecord = () => {
        const inx = VOICE_LANGUAGES.findIndex(
          (langRecord) => langRecord.code === langCode,
        );
        return inx > -1 ? VOICE_LANGUAGES[inx] : null;
      };

      // Use string-similality (Dice's Coof) to find best format used in voice
      const findBestSentence = (s: string, ss: string[]) => {
        const bestMatch = findBestMatch(s, ss);
        //console.log("Best=", bestMatch.ratings);
        //console.log("Best sentence=", ss[bestMatch.bestMatchIndex]);
        return bestMatch;
      };

      // Given piece name (singular) find it's/their position/positions
      const findPiecePosition = (pType: PieceType, pColor?: PieceColorType) => {
        if (!pColor) pColor = chess.turn();
        const res: Square[] = [];
        const board = chess.board();
        for (let r = 0; r < BOARD_ROWS; r++) {
          for (let c = 0; c < BOARD_COLS; c++) {
            const cell = board[r][c];
            if (cell && cell.color === pColor && cell.type === pType) {
              // console.log("FOUND", cell, r, c);
              res.push(convertArrCoord2Notation(r, c) as Square);
            }
          }
        }
        return res;
      };

      // Given piece name (singular) find it's/their position/positions
      const getPieceAt = (square: Square) => {
        const piece = chess.get(square);
        return piece ? piece.type : null;
      };

      // Check piece at a coordinate (if exist, correct type, correct color)
      const isPieceAtCoord = (
        square: Square,
        pType: PieceType,
        pColor?: PieceColorType,
      ) => {
        if (!pColor) pColor = chess.turn();
        const piece = chess.get(square);
        return piece && piece.type === pType && piece.color === pColor;
      };

      // Given "takes" format, find attacked pieces position
      const findAttackedPiece = () => {};

      // Given a position (thus piece), find all opposite attackers to that position
      const findAttackerList = (square: Square) => {
        const pColor = chess.turn(); // current player color
        const tPiece = chess.get(square); // what is in destination?
        const res: Square[] = [];
        if (tPiece && pColor === tPiece.color) {
          // piece at the target and same color?
          debugSTTValidator &&
            console.log("ERR-SAME-COLOR-PIECE=", square, tPiece);
          return [];
        } else {
          // there is a piece from other side
          for (let r = 0; r < BOARD_ROWS; r++) {
            for (let c = 0; c < BOARD_COLS; c++) {
              const cell = chess.board()[r][c];
              // if friend piece found
              if (cell && cell.color === pColor) {
                // check if target is in its possible moves
                const fromSquare = convertArrCoord2Notation(r, c) as Square;
                // can it attack there?
                const moves = chess
                  .moves({
                    verbose: true,
                    square: fromSquare,
                  })
                  .filter((m) => m.to === square);
                // console.log(fromSquare, "=>", moves);
                moves.forEach((m) => {
                  res.push(fromSquare);
                }); // foreach
              } // if
            } // for c
          } // for r
          debugSTTValidator && console.log("ATTACKERS=", res);
          return res; // return resultant list
        } // else
      }; // findAttackerList

      //
      // sttPostProcess - Main part
      //
      debugSTTValidator &&
        console.log(
          "-------------------\nSTART RECOGNIZE MOVE\n-------------------",
        );
      clearPanels();
      const turnColor = chess.turn();
      console.log(
        "Language=",
        langCode,
        "Player=",
        turnColor,
        "Parse=",
        rawText,
      );
      //
      // Find Voice-Chess Language Record & Get language data
      //
      const langRecord = findLanguageRecord();
      if (!langRecord) return null;

      const locSentences = langRecord.sentences;
      const locPieces = langRecord.pieces;
      const locCols = langRecord.colNames;
      const locRows = langRecord.rowNames;
      // make them lowercase
      locSentences.forEach((s, i) => {
        locSentences[i] = s.toLocaleLowerCase(langCode);
      });
      locPieces.forEach((p, i) => {
        locPieces[i].nativeName = p.nativeName.toLocaleLowerCase(langCode);
      });
      locCols.forEach((s, i) => {
        locCols[i] = s.toLocaleLowerCase(langCode);
      });
      locRows.forEach((s, i) => {
        locRows[i] = s.toLocaleLowerCase(langCode);
      });

      //
      // PreProcess to find piece names and coordinates
      //

      // split the sentence
      const rawWords = rawText.split(" ");
      //debugSTTValidator && console.log("RAW=", rawWords);

      // find piece: For each word, try to find piecename.
      const foundPieces: PieceNamesType[] = []; // result array, ordered by appearence
      const foundPieceTypes: PieceType[] = []; // chess.js types
      rawWords.forEach((w) => {
        locPieces.forEach((p) => {
          if (w.substring(0, p.nativeName.length) === p.nativeName) {
            // debugSTTValidator && console.log("found=", w, p);
            foundPieces.push(p);
            foundPieceTypes.push(
              PIECE_NAMES_SHORT[p.piece].toLowerCase() as PieceType,
            );
          }
        });
      });
      debugSTTValidator &&
        console.log("FOUND PIECES=", foundPieces, foundPieceTypes);

      // find from & to coordinates
      const foundCoords: string[] = []; // result array, ordered by appearence
      const foundCoordCodes: Square[] = []; // chess.js types
      rawWords.forEach((w) => {
        locCols.forEach((c) => {
          // check only the first part
          if (w.substring(0, c.length) === c) {
            // console.log("found=", w, c);
            foundCoords.push(w); // but return whole coord
            const rowInx = locRows.findIndex(
              // find row (number)
              (r) => r === w.substring(c.length, c.length + r.length),
            );
            // console.log("rowInx=", rowInx);
            if (rowInx > -1) {
              // found it
              const colChar = w.substring(0, 1); // get a,b,c..h
              const rowChar = (rowInx + 1).toString();
              // console.log("colChar=", colChar, "rowChar=", rowChar);
              foundCoordCodes.push((colChar + rowChar) as Square);
            }
          }
        });
      });
      debugSTTValidator &&
        console.log("FOUND COORDS=", foundCoords, foundCoordCodes);

      // Insert these findings into sentences
      const tSentences = locSentences.slice(); // create temporary sentences
      const tAlgorithms = []; // create temporary sentences
      for (let i = 0; i < tSentences.length; i++) {
        const arr = tSentences[i].split("|");
        tSentences[i] = arr[0];
        tAlgorithms[i] = arr[1];
      }
      // for each sentence template
      for (let i = 0; i < tSentences.length; i++) {
        // clean from inc. suffixes
        tSentences[i] = tSentences[i].replace(
          "{fromcol}{fromrow}{fromsuffix}",
          "{col}{row}",
        );
        tSentences[i] = tSentences[i].replace(
          "{fromcol}{fromrow}{atsuffix}",
          "{col}{row}",
        );
        tSentences[i] = tSentences[i].replace(
          "{fromcol}{fromrow}",
          "{col}{row}",
        );
        // clean to inc. suffixes
        tSentences[i] = tSentences[i].replace(
          "{tocol}{torow}{tosuffix}",
          "{col}{row}",
        );
        tSentences[i] = tSentences[i].replace(
          "{tocol}{torow}{towardssuffix}",
          "{col}{row}",
        );
        tSentences[i] = tSentences[i].replace(
          "{tocol}{torow}{atsuffix}",
          "{col}{row}",
        );
        tSentences[i] = tSentences[i].replace("{tocol}{torow}", "{col}{row}");
        // for each piece
        foundPieces.forEach((p) => {
          tSentences[i] = tSentences[i].replace(
            "{piece}{piecesuffix}",
            p.nativeName,
          );
          tSentences[i] = tSentences[i].replace(
            "{piece}{pieceTosuffix}",
            p.nativeName,
          );
          tSentences[i] = tSentences[i].replace("{piece}", p.nativeName);
        });
        // for each coord
        foundCoords.forEach((c) => {
          tSentences[i] = tSentences[i].replace("{col}{row}", c);
        });
        //debugSTTValidator && console.log("replaced=", tSentences[i]);
      }

      //
      // Find best fitting sentence format
      //
      const best = findBestSentence(rawText, tSentences);
      debugSTTValidator && console.log("BEST=", best.bestMatch.target);
      debugSTTValidator && console.log("RATINGS=", best);
      const algo = tAlgorithms[best.bestMatchIndex];

      // PROGRAM COMMANDS
      // !play_black
      // !play_white
      // !undo
      // !reset
      // !finish
      // !replay
      let isFinished = false;
      if (!algo || algo.charAt(0) === "!") {
        debugSTTValidator && console.log("CMD=", algo);
        switch (algo) {
          case "!play_black":
            isFinished = true;
            break;
          case "!play_white":
            isFinished = true;
            break;
          case "!undo":
            chess.undo();
            isFinished = true;
            break;
          case "!reset":
          case "!finish":
            chess.reset();
            isFinished = true;
            break;
          case "!replay":
            isFinished = true;
            break;
          default:
        }
      }

      if (isFinished) return;

      // possible algorithms
      // SPECIAL: resign & castling
      // pft  => check p @ f => check t possible
      // pt   => find p coord => check t possible
      // ft   => find f => p => check t possible
      // t    => find t => find attackers, possible if single
      // pp   => find p1 coords & find p1 coords => find if any p1 can take any p2 => possible if single

      // ERRORS
      // - wrong color
      // - incorrect from foord
      // - incorrect to coord
      // - invalid move

      // Given piecename,  get all Pieces' squares with specified type, to check later
      let pieceCoords: Square[] = [];
      if (algo.includes("p") && foundPieceTypes.length > 0)
        pieceCoords = findPiecePosition(foundPieceTypes[0]);
      debugSTTValidator && console.log("pieceCoords=", pieceCoords);

      // given target coordinate, get all possible moves to check later
      // let allMoves: Square[] = [];
      // if (algo.includes("t") && foundCoordCodes.length > 0)
      //   allMoves = chess.moves() as Square[];
      // debugSTTValidator && console.log("allMoves=", allMoves);

      debugSTTValidator && console.log("ALGO=", algo);

      // Special Cases
      if (!algo || algo.charAt(0) === "_") {
        debugSTTValidator && console.log("SPECIAL=", algo);
        switch (best.bestMatch.target) {
          case "_x":
            // ignore these
            break;
          case "_resign":
            // resign
            break;
          case "_castling1":
            // kingside castle
            if (turnColor === "b") {
              handleMove("e8", "g8");
            } else {
              handleMove("e1", "g1");
            }
            break;
          case "_castling2":
            // queenside castle
            if (turnColor === "b") {
              handleMove("e8", "c8");
            } else {
              handleMove("e1", "c1");
            }
            break;
          default:
        }
      }

      // MAIN ALGORITHMS
      let tPiece: PieceType | null = null;
      let tPiece1: PieceType | null = null;
      let tPiece2: PieceType | null = null;
      let tCoord: Square | null = null;
      let tCoord1: Square | null = null;
      let tCoord2: Square | null = null;

      if (algo === "pft") {
        //
        // PIECE-FROM-TO
        //
        // && first coord must be in position of all those pieces' coordinates
        // && calc possible target coords
        tPiece = foundPieceTypes[0];
        tCoord1 = foundCoordCodes[0];
        tCoord2 = foundCoordCodes[1];
        showSuggestedMove(tPiece, tCoord1, tCoord2);
        if (!pieceCoords.includes(tCoord1)) {
          debugSTTValidator && console.log("ERROR=", tPiece, tCoord1, tCoord2);
          moveError("Wrong piece coordinates!");
        } else {
          const moves = chess
            .moves({ verbose: true, square: tCoord1 })
            .filter((m) => m.to === tCoord2);
          if (moves.length === 0) {
            debugSTTValidator &&
              console.log("ERROR=", tPiece, tCoord1, tCoord2);
            moveError("Piece cannot move to target coordinates!");
          } else {
            // now we TRY
            handleMove(tCoord1, tCoord2);
          }
        }
      } else if (algo === "ft") {
        //
        // FROM-TO
        //
        // && find piece from the first coordinate and check any
        // && calc possible target coords
        tCoord1 = foundCoordCodes[0];
        tCoord2 = foundCoordCodes[1];
        tPiece = getPieceAt(tCoord1);
        debugSTTValidator && console.log("FOUND PIECE AT", tCoord1, "is", tPiece);
        tPiece
          ? showSuggestedMove(tPiece, tCoord1, tCoord2)
          : showSuggestedMove("?", tCoord1, tCoord2);
        if (!tPiece) {
          debugSTTValidator && console.log("ERROR=", tPiece, tCoord1, tCoord2);
          moveError("Piece not found!");
        } else if (!chess.moves({ verbose: true, square: tCoord1 }).filter(m => m.to === tCoord2)) {
          debugSTTValidator && console.log("ERROR=", tPiece, tCoord1, tCoord2);
          debugSTTValidator && console.log("MOVES OF PIECE=", chess.moves({ square: tCoord1 }));
          moveError("Piece cannot move to this target!");
        } else {
          // now we TRY
          handleMove(tCoord1, tCoord2);
        }
      } else if (algo === "pt") {
        //
        // PIECE-TO
        //
        // && there must be a single attacker of type p to coord t
        tPiece = foundPieceTypes[0];
        tCoord1 = null;
        tCoord2 = foundCoordCodes[0];
        const tAttackers = findAttackerList(tCoord2).filter(
          (t) => tPiece === chess.get(t)?.type,
        );
        // if none found, error
        if (tAttackers.length === 0) {
          debugSTTValidator && console.log("ERROR=", tCoord2);
          moveError("No piece can move to this target!");
        } else if (tAttackers.length > 1) {
          debugSTTValidator && console.log("ERROR=", tCoord2, tAttackers);
          moveError("Multiple pieces can target this coordinate!");
        } else {
          // a single attacker case
          tCoord1 = tAttackers[0];
          showSuggestedMove(tPiece, tCoord1, tCoord2);
          // now we TRY
          handleMove(tCoord1, tCoord2);
        }
      } else if (algo === "t") {
        //
        // TO
        //
        // && there must be a single attacker of type p to coord t
        tPiece = null;
        tCoord1 = null;
        tCoord2 = foundCoordCodes[0];
        const tAttackers = findAttackerList(tCoord2);
        // if none found, error
        if (tAttackers.length === 0) {
          debugSTTValidator && console.log("ERROR=", tCoord2 , tAttackers);
          moveError("No piece can move to this target!");
        } else if (tAttackers.length > 1) {
          debugSTTValidator && console.log("ERROR=", tCoord2, tAttackers);
          moveError("Multiple pieces can target this coordinate!");
        } else {
          // a single attacker case
          tCoord1 = tAttackers[0];
          tPiece = getPieceAt(tCoord1);
          showSuggestedMove(tPiece!, tCoord1, tCoord2);
          // now we TRY
          handleMove(tCoord1, tCoord2);
        }
      } else if (algo === "pp") {
        //
        // PIECE-PIECE
        //
        // && there must be a single attacker of type p to coord t
        tPiece1 = foundPieceTypes[0];
        tPiece2 = foundPieceTypes[1];
        tCoord1 = null;
        tCoord2 = null;
        // find all piece1's
        const pColor = chess.turn();
        const tColor = pColor === "w" ? "b" : "w";
        const tFromPieces = findPiecePosition(tPiece1, pColor); // Get players pieces of this brand
        const tToPieces = findPiecePosition(tPiece2, tColor); // Get opponent pieces of that brand
        console.log("FROM PIECES", tFromPieces);
        console.log("TO PIECES", tToPieces);
        let tAttackers: Square[] = [];
        let tAttacked: Square[] = [];
        // loop from coords
        tFromPieces.forEach((f) => {
          const fMoves = chess.moves({ verbose: true, square: f }); // get possible moves
          // loop to coords
          tToPieces.forEach((t) => {
            // loop possible moves from from coord
            fMoves.forEach((fm) => {
              if (fm.to === t) {
                tAttackers.push(fm.from);
                tAttacked.push(fm.to);
              } // if from.move = to then it is OK
            });
          });
        });
        // if none found, error
        if (tAttackers.length === 0) {
          debugSTTValidator && console.log("ERROR=", tPiece1, tPiece2);
          moveError("No piece couple found!");
        } else if (tAttackers.length > 1) {
          debugSTTValidator && console.log("ERROR=", tPiece1, tPiece2);
          moveError("Multiple possibilities found!");
        } else {
          // single solution
          tCoord1 = tAttackers[0];
          tCoord2 = tAttacked[0];
          showSuggestedMove(tPiece1, tCoord1, tCoord2);
          // now we TRY
          handleMove(tCoord1, tCoord2);
        }
      } else {
        console.warn("STT-NO-ALGO:", rawText);
      }
      // VALIDATION AND/OR MOVE FINISHED
    },
    [langCode, chess, setLastError],
  );

  useEffect(() => {
    isMounted && sttTxt !== "" && sttPostProcess(sttTxt);
  }, [sttTxt]);
  //}, [chess, sttTxt, suggestedMove, sttPostProcess]);

  // cleanup
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // References

  return (
    <>
      <CurrentPlayer color={chess.turn()} />
      <span title="Last recognized sentence" className="svPanelText">
        {sttTxt}
      </span>
      {/* <span
        title="Recognized chess move"
        className="svPanelText"
        style={{ width: "60px", minWidth: "60px" }}
      >
        {suggestedMove}
      </span> */}
      <MovePanel move={suggestedMove} />
      <FeedbackPanel text={lastError} />
      <SpecialStatusDisplay />
    </>
  );
};

export { STTValidator };
