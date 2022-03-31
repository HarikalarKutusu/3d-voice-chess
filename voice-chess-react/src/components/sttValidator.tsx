import { useState, useEffect, useCallback, useRef } from "react";
// similarity checker
import { findBestMatch } from "string-similarity";

// VOICE-CHESS
import {
  PIECECOLOR_WHITE,
  PIECECOLOR_BLACK,
  BOARD_ROWS,
  BOARD_COLS,
  convertArrCoord2Notation,
} from "./../helpers/chessHelper";

import { PieceColorType } from "./../helpers/voiceHelper";

import { VoiceLanguageType, VOICE_LANGUAGES } from "./../helpers/localeHelper";

// Icons
import { GiChessKing as KingIcon } from "@react-icons/all-files/gi/GiChessKing";
import { GiChessPawn as PawnIcon } from "@react-icons/all-files/gi/GiChessPawn";
import { FaEquals as EqualIcon } from "@react-icons/all-files/fa/FaEquals";

// Store
import { useStore } from "../stores/vcstore";

import "./socketVoice.css";

// Chess
import { PieceType, Square } from "chess.js";
import * as ChessJS from "chess.js";
const Chess = typeof ChessJS === "function" ? ChessJS : ChessJS.Chess;

// DEBUG
const debugSTTValidator = true;

export type ISTTValidatorProps = {
  // langRecord: VoiceLanguageType | undefined; // should be provided
  sttTxt: string; // default: ""
  errTxt?: string; // default: ""
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
  const { chess } = useStore();
  const { langCode } = useStore();
  const { lastError, setLastError } = useStore();

  // local globals
  const iconSize = 24;
  // const iconPassiveColor = "#eee";
  // const iconActiveColor = "#3cc";
  // const iconButtonPassiveColor = "#333";

  // Return Language record
  const findLanguageRecord = (langCode: string) => {
    const inx = VOICE_LANGUAGES.findIndex(
      (langRecord) => langRecord.code === langCode,
    );
    return inx > -1 ? (VOICE_LANGUAGES[inx] as VoiceLanguageType) : null;
  };

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
      /*
      const findLanguageRecord = () => {
        const inx = VOICE_LANGUAGES.findIndex(
          (langRecord) => langRecord.code === langCode,
        );
        return inx > -1 ? VOICE_LANGUAGES[inx] : null;
      };
      */

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
      /*
      const isPieceAtCoord = (
        square: Square,
        pType: PieceType,
        pColor?: PieceColorType,
      ) => {
        if (!pColor) pColor = chess.turn();
        const piece = chess.get(square);
        return piece && piece.type === pType && piece.color === pColor;
      };
      */

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

      //----------------------------------
      // sttPostProcess - Main part
      //----------------------------------
      const langRecord = findLanguageRecord(langCode) as VoiceLanguageType;
      if (!langRecord) return null;
      debugSTTValidator &&
        console.log(
          "-------------------\nSTART RECOGNIZE MOVE\n-------------------",
        );
      clearPanels();
      const turnColor = chess.turn();
      console.log(
        "Language=",
        langRecord?.code,
        "Player=",
        turnColor,
        "Parse=",
        rawText,
      );
      //
      // Find Voice-Chess Language Record & Get language data
      //
      //const langRecord = findLanguageRecord();
      //if (!langRecord) return null;

      const locSentences = langRecord.sentences;
      const locPieceNames = langRecord.pieceNames;
      const locPieceCodes = langRecord.pieceCodes;
      const locCols = langRecord.colNames;
      const locRows = langRecord.rowNames;
      const locIntents = langRecord.intents;
      //
      // PreProcess to find piece names and coordinates
      //

      // split the sentence
      const rawWords = rawText.split(" ");
      //debugSTTValidator && console.log("RAW=", rawWords);

      // find piece: For each word, try to find piecename.
      const foundPieceNames: string[] = []; // result array, ordered by appearence
      const foundPieceCodes: PieceType[] = []; // chess.js types
      rawWords.forEach((w) => {
        locPieceNames.forEach((p, index) => {
          if (w.substring(0, p.length) === p) {
            // debugSTTValidator && console.log("found=", w, p);
            foundPieceNames.push(p);
            foundPieceCodes.push(locPieceCodes[index]);
          }
        });
      });
      debugSTTValidator &&
        console.log("FOUND PIECES=", foundPieceNames, foundPieceCodes);

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
      const tS = locSentences.slice(); // create temporary sentences
      /*
      const tA = []; // create temporary sentences
      for (let i = 0; i < tS.length; i++) {
        const arr = tS[i].split("|");
        tS[i] = arr[0];
        tA[i] = arr[1];
      }
      */
      // for each sentence template
      for (let i = 0; i < tS.length; i++) {
        // clean from inc. suffixes
        tS[i] = tS[i].replace("{fromCol}{fromRow}{fromSuffix}", "{col}{row}");
        tS[i] = tS[i].replace("{fromCol}{fromRow}{atSuffix}", "{col}{row}");
        tS[i] = tS[i].replace("{fromCol}{fromRow}", "{col}{row}");
        // clean to inc. suffixes
        tS[i] = tS[i].replace("{toCol}{toRow}{toSuffix}", "{col}{row}");
        tS[i] = tS[i].replace("{toCol}{toRow}{towardsSuffix}", "{col}{row}");
        tS[i] = tS[i].replace("{toCol}{toRow}{atSuffix}", "{col}{row}");
        tS[i] = tS[i].replace("{toCol}{toRow}", "{col}{row}");
        // for each piece
        foundPieceNames.forEach((p) => {
          tS[i] = tS[i].replace("{piece}{pieceSuffix}", p);
          tS[i] = tS[i].replace("{piece}{pieceToSuffix}", p);
          tS[i] = tS[i].replace("{piece}", p);
        });
        // for each coord
        foundCoords.forEach((c) => {
          tS[i] = tS[i].replace("{col}{row}", c);
        });
        //debugSTTValidator && console.log("replaced=", tSentences[i]);
      }

      //
      // Find best fitting sentence format
      //
      const best = findBestSentence(rawText, tS);
      const intent = locIntents[best.bestMatchIndex];
      debugSTTValidator && console.log("BEST=", best.bestMatch.target);
      debugSTTValidator && console.log("RATINGS=", best);
      debugSTTValidator && console.log("INTENT=", "["+intent+"]");

      // INTENT REFERENCE
      /*
        + move.001 - echofour
        + move.011 - move echotwo to echofour
        + move.101 - pawn to echofour
        + move.111 - move pawn from echotwo to echofour
        + move.200 - bishop takes pawn
        + move.201 - bishop takes pawn at echofive
        + move.210 - bishop at echofive takes pawn
        + move.211 - pawn at echofour takes pawn at deltafive

        . castling.kingside
        . castling.queenside
        promotion

        command.drawoffer
        command.drawaccept

        + ignored

        + command.undo

        command.playblack
        command.playwhite
        + command.reset
        . command.finish
        command.replay
        command.help
        command.hint
        command.micoff
        command.disconnect

        command.difficulty
        command.joinroom
      */

      // HANDLE NON-MOVE INTENTS

      let isFinished = true;

      switch (intent) {
        // ignored
        case "ignored":
          console.log("IGNORED INTENT:", intent);
          break;

        // in game special moves
        case "castling.kingside":
          // kingside castling
          turnColor === "b" ? handleMove("e8", "g8") : handleMove("e1", "g1");
          break;
        case "castling.queenside":
          // queenside castling
          turnColor === "b" ? handleMove("e8", "c8") : handleMove("e1", "c1");
          break;

        // in game commands
        case "command.undo":
          chess.undo();
          break;
        case "command.reset":
        case "command.finish":
          chess.reset();
          break;

        // before game commands

        // UNIMPLEMENTED ONES
        case "promotion":
        case "command.drawoffer":
        case "command.drawaccept":
        case "command.playblack":
        case "command.playwhite":
        case "command.replay":
        case "command.help":
        case "command.hint":
        case "command.micoff":
        case "command.disconnect":
        case "command.difficulty":
        case "command.joinroom":
        case "commmand.computer":
          console.warn("UNIMPLEMENTED INTENT:", intent);
          break;
        // IF NOT HERE, SO IT SHOULD BE A MOVE, SO GO ON
        default:
          console.log("MOVE INTENT?", intent);
          isFinished = false;
      }

      if (isFinished) return;

      // ERRORS
      // - wrong color
      // - incorrect from foord
      // - incorrect to coord
      // - invalid move

      // Given piecename,  get all Pieces' squares with specified type, to check later
      let pieceCoords: Square[] = [];
      if (intent.charAt(0) !== "0" && foundPieceCodes.length > 0)
        pieceCoords = findPiecePosition(foundPieceCodes[0]);
      debugSTTValidator && console.log("pieceCoords=", pieceCoords);

      // MAIN ALGORITHMS
      let tPiece: PieceType | null = null;
      let tPiece1: PieceType | null = null;
      let tPiece2: PieceType | null = null;
      let tCoord: Square | null = null;
      let tCoord1: Square | null = null;
      let tCoord2: Square | null = null;

      if (intent === "move.111") {
        //
        // PIECE-FROM-TO
        //
        // && first coord must be in position of all those pieces' coordinates
        // && calc possible target coords
        tPiece = foundPieceCodes[0];
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
      } else if (intent === "move.011") {
        //
        // FROM-TO
        //
        // && find piece from the first coordinate and check any
        // && calc possible target coords
        tCoord1 = foundCoordCodes[0];
        tCoord2 = foundCoordCodes[1];
        tPiece = getPieceAt(tCoord1);
        debugSTTValidator &&
          console.log("FOUND PIECE AT", tCoord1, "is", tPiece);
        tPiece
          ? showSuggestedMove(tPiece, tCoord1, tCoord2)
          : showSuggestedMove("?", tCoord1, tCoord2);
        if (!tPiece) {
          debugSTTValidator && console.log("ERROR=", tPiece, tCoord1, tCoord2);
          moveError("Piece not found!");
        } else if (
          !chess
            .moves({ verbose: true, square: tCoord1 })
            .filter((m) => m.to === tCoord2)
        ) {
          debugSTTValidator && console.log("ERROR=", tPiece, tCoord1, tCoord2);
          debugSTTValidator &&
            console.log("MOVES OF PIECE=", chess.moves({ square: tCoord1 }));
          moveError("Piece cannot move to this target!");
        } else {
          // now we TRY
          handleMove(tCoord1, tCoord2);
        }
      } else if (intent === "move.101") {
        //
        // PIECE-TO
        //
        // && there must be a single attacker of type p to coord t
        tPiece = foundPieceCodes[0];
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
      } else if (intent === "move.001") {
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
          debugSTTValidator && console.log("ERROR=", tCoord2, tAttackers);
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
      } else if (intent === "move.200") {
        //
        // PIECE-PIECE
        //
        // && there must be a single attacker of type p to coord t
        tPiece1 = foundPieceCodes[0];
        tPiece2 = foundPieceCodes[1];
        tCoord1 = null;
        tCoord2 = null;
        // find all piece1's
        const pColor = chess.turn();
        const tColor = pColor === "w" ? "b" : "w";
        const tFromPieces = findPiecePosition(tPiece1, pColor); // Get players pieces of this brand
        const tToPieces = findPiecePosition(tPiece2, tColor); // Get opponent pieces of that brand
        // console.log("FROM PIECES", tFromPieces);
        // console.log("TO PIECES", tToPieces);
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
      } else if (intent === "move.201") {
        //
        // PIECE-PIECE-AT
        //
        // && there must be a single attacker of type p to coord t
        tPiece1 = foundPieceCodes[0];
        tPiece2 = foundPieceCodes[1];
        tCoord1 = null;
        tCoord2 = foundCoordCodes[0];
        const tAttackers = findAttackerList(tCoord2).filter(
          (t) => tPiece1 === chess.get(t)?.type,
        );
        const tToPiece = getPieceAt(tCoord2);
        if (!tToPiece) {
          // no piece at target
          debugSTTValidator &&
            console.log("ERROR=", tCoord2, tPiece2, tToPiece);
          moveError("No piece at the target!");
        } else if (tPiece2 !== tToPiece[0]) {
          // not correct piece
          debugSTTValidator &&
            console.log("ERROR=", tCoord2, tPiece2, tToPiece);
          moveError("Target piece not correct!");
        } else if (tAttackers.length === 0) {
          debugSTTValidator && console.log("ERROR=", tCoord2);
          moveError("No piece can move to this target!");
        } else if (tAttackers.length > 1) {
          debugSTTValidator && console.log("ERROR=", tCoord2, tAttackers);
          moveError("Multiple pieces can target this coordinate!");
        } else {
          // a single attacker case
          tCoord1 = tAttackers[0];
          showSuggestedMove(tPiece1, tCoord1, tCoord2);
          // now we TRY
          handleMove(tCoord1, tCoord2);
        }
      } else if (intent === "move.210") {
        //
        // PIECE-FROM-PIECE
        //
        // && there must be a single attacker of type p to coord t
        tPiece1 = foundPieceCodes[0];
        tPiece2 = foundPieceCodes[1];
        tCoord1 = foundCoordCodes[0];
        tCoord2 = null;
        // find all piece1's
        const pColor = chess.turn();
        const tColor = pColor === "w" ? "b" : "w";
        const tFromPiece = getPieceAt(tCoord1); // Get players piece at that position
        const tToPieces = findPiecePosition(tPiece2, tColor); // Get opponent pieces of that brand
        console.log("FROM PIECE", tFromPiece);
        console.log("TO PIECES", tToPieces);
        //let tAttackers: Square[] = [];
        let tAttacked: Square[] = [];
        // loop from coords
        const fMoves = chess.moves({ verbose: true, square: tCoord1 }); // get possible moves
        console.log("MOVES", fMoves);
        // loop to coords
        tToPieces.forEach((t) => {
          // loop possible moves from from coord
          fMoves.forEach((fm) => {
            if (fm.to === t) {
              tAttacked.push(fm.to);
            } // if from.move = to then it is OK
          });
        });
        // if none found, error
        if (tPiece1 !== tFromPiece) {
          debugSTTValidator && console.log("ERROR=", tPiece1, tFromPiece);
          moveError("Wrong piece at start point!");
        } else if (tAttacked.length === 0) {
          debugSTTValidator &&
            console.log("ERROR=", tPiece1, tPiece2, tAttacked);
          moveError("Invalid target");
        } else if (
          tAttacked.length === 1 &&
          getPieceAt(tAttacked[0]) !== tPiece2
        ) {
          debugSTTValidator &&
            console.log("ERROR=", tPiece1, tPiece2, tAttacked);
          moveError("Target position does not have mentioned piece!");
        } else if (tAttacked.length > 1) {
          debugSTTValidator &&
            console.log("ERROR=", tPiece1, tPiece2, tAttacked);
          moveError("Multiple possibilities found!");
        } else {
          // single solution
          tCoord2 = tAttacked[0];
          showSuggestedMove(tPiece1, tCoord1, tCoord2);
          // now we TRY
          handleMove(tCoord1, tCoord2);
        }
      } else {
        console.warn("STT-NO-ALGO:", rawText, langRecord);
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
