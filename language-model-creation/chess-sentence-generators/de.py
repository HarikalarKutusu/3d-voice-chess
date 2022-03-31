# voice-chess application language model sentence generator

# IMPORTANT: Only use lowercase characters. Unicode lower conversions can cause problems.
# They are totally unnecessary, steal CPU cycles and code space.

import json
from _common import getChessMoves, mayStripSpaces, writeToFile, addIntent
from _common import possibleMoveIntents, promotionOptions

########################################
# LOCALIZE THESE
########################################
lCode = "de"
lName = "German"
lNativeName = "Deutsch"

# chess piece colors
colors = ["swarz", "weiss"]
# chess piece names
pieces = ["koenig", "dame", "turm", "laeufer", "springer", "bauer"]
# you need to specify what that means in chess as some languages have multiple names for some pieces.
# here is the coding format: # KING: k, QUEEN: q, ROOK: r, BISHOP: b, KNIGHT: n, PAWN: p
pcodes = ["k", "q", "r", "b", "n", "p"]
# chess cols - localized characters [A-H] as strings - DO NOT CHANGE THIS, SIMPLE CHARS DO NOT WORK
cols = ["alpha", "bravo", "charlie", "delta",
        "echo", "foxtrot", "golf", "hotel"]
# chess rows - localized numbers [1-8] as strings - 8 tokens
rows = ["eins", "zwei", "drei", "vier", "fuenf", "sechs", "sieben", "acht"]

# LANGUAGE IS DEVIDED INTO INTENTS, WHICH WILL BE PROCESSED BY THE CLIENT

# MOVE INTENTS are for piece moving
# possible movement/capture formats - write anything possible here
# ex: "move {piece} from {fromCol}{fromRow} to {toCol}{toRow}"
iMove = [
    # moves
    "{piece} zieht von {fromCol}{fromRow} nach {toCol}{toRow}",
    "zieh {fromCol}{fromRow} nach {toCol}{toRow}",
    "{piece} auf {fromCol}{fromRow} zieht nach {toCol}{toRow}",
    "{piece} auf {fromCol}{fromRow} nach {toCol}{toRow}",
    "{piece} {fromCol}{fromRow} zieht nach {toCol}{toRow}",
    "{piece} {fromCol}{fromRow} nach {toCol}{toRow}",
    "zieh {piece} nach {toCol}{toRow}",
    "{piece} zieht nach {toCol}{toRow}",
    "{piece} nach {toCol}{toRow}",
    "{fromCol}{fromRow} {toCol}{toRow}",
    "{toCol}{toRow}",
    "weisse {piece} zieht nach {toCol}{toRow}",
    "weisse {piece} nach {toCol}{toRow}",
    "schwarze {piece} zieht nach {toCol}{toRow}",
    "schwarze {piece} nach {toCol}{toRow}",
    # captures
    "{piece} {fromCol}{fromRow} schlaegt {toCol}{toRow}",
    "{piece} schlaegt {toCol}{toRow}",
    "{piece} auf {fromCol}{fromRow} schlaegt {piece}",
    "{piece} schlaegt {piece}",
    "{piece} schlaegt {piece} auf {toCol}{toRow}",
    "schlaegt {toCol}{toRow}",
]

# Promotions
iPromotion = ["Bauernumwandlung zur {piece}", "Bauernumwandlung zum {piece}"]

# KINGSIDE/QUEENSIDE CASTLING INTENTS
iCastlingKingside = ["rochade am koenigsfluegel", "koenigsfluegel rochade"]
iCastlingQueenside = ["rochade am damenfluegel", "damenfluegel rochade"]

# RESIGN INTENTS
iResign = ["ich gebe auf", "schwarz gibt auf", "weiss gibt auf"]

# OFFER/ACCEPT DRAW INTENTS
iDrawOffer = ["ich biete unentschieden an"]
iDrawAccept = ["ich akzeptiere unentschieden"]

# IGNORED INTENTS
iIgnored = ["schach", "matt", "patt"]

# GAME COMMAND INTENTS
iCommandUndo = ["rueckgehen", "bewegung rueckgaengig machen",
                "zuruecknehmen", "nehme zurueck", "zurueckbringen"]
iCommandPlayBlack = ["schwarz spielen"]
iCommandPlayWhite = ["weiss spielen"]
iCommandReset = ["zuruecksetzen", "spiel zuruecksetzen"]
iCommandFinish = ["spiel beenden"]
iCommandReplay = ["spiel wiederholen"]
iCommandHelp = ["hilfe", "zeig hilfe"]
iCommandHint = ["hinweis", "hinweis zeigen", "zeig hinweis"]
iCommandMicOff = ["mikrofon aus", "mikrofon ausmachen"]
iCommandDisconnect = [
    "trennen",
    "server trennen",
    "vom server trennen"
]
iCommandPlayComputer = ["gegen computer spielen"]

# with numbers
iCommandDifficulty = [
    "schwierigkeit {number}",
    "schwierigkeitsgrad {number}",
    "stelle die schwierigkeit auf {number} ein",
    "stufe {number}",
    "stufe auf {number} stellen",
    "stelle die schwierigkeitsgrad auf {number} ein"
]
iCommandJoinRoom = [
    "betrete raum {number}",
    "spiel {number} mitmachen",
    "spiel in raum {number}"
]

########################################
# PARAMETERS - FOR EXPERIMENTING
########################################

doStripSpaces = False

#############################################################################################
# GENERATOR CODE, DO NOT TOUCH UNLESS YOUR LANGUAGE REQUIRES SPECIAL HANDLING (e.g. suffixes)
#############################################################################################

# The following are used to parse the chess moves file
alphabet = ["a", "b", "c", "d", "e", "f", "g", "h"]
numerals = ["1", "2", "3", "4", "5", "6", "7", "8"]
SEP = "|"

# filenames
fnChessMoves = "chess-moves.txt"
fnTemp = ".tmp/" + lCode + ".tmp"
fnTxt = ".out/" + lCode + ".txt"
fnJson = ".out/" + lCode + ".json"

# get possible chess moves
moves = getChessMoves(fnChessMoves)

# ----------------------------------------
# Main Generator - loop every combination
# ----------------------------------------

# open a temporary file for utf-8 writing
tf = open(fnTemp, "w", encoding="utf-8")

# Those with only number parameters - append intents
iCommandDifficulty = addIntent(iCommandDifficulty, "command.difficulty")
iCommandJoinRoom = addIntent(iCommandJoinRoom, "command.joinroom")
for number in rows:
    for s in iCommandDifficulty:
        tf.write(mayStripSpaces(s.format(number=number), doStripSpaces)+"\n")
    for s in iCommandJoinRoom:
        tf.write(mayStripSpaces(s.format(number=number), doStripSpaces)+"\n")

# Promotions - append intents
iPromotion = addIntent(iPromotion, "promotion")
for p in promotionOptions:
    for s in iPromotion:
        piece = pieces[pcodes.index(p)]  # get localized piecename
        res = s.format(piece=piece)  # replace parameter
        tf.write(mayStripSpaces(res, doStripSpaces)+"\n")  # write to file


# Algorithm:
# Loop: For each sentence
# Loop: For each possible move in "moves"
# Get localized wording (piece, row and column names)
# Replace {x} in the sentence with respective words and output the result

# preprocess sentences to add intents
iMovesIntent = []
for s in iMove:
    # calc intent - find occurrences in the raw sentence
    pieceCnt = s.count("{piece}")
    fromCnt = s.count("{fromCol}")
    toCnt = s.count("{toCol}")
    tempIntent = str(pieceCnt) + str(fromCnt) + str(toCnt)
    # warn if not OK
    if not(tempIntent in possibleMoveIntents):
        print("Warning: Possible sentence problem/wrong intent")
        print("Sentence:", s, " intent:", tempIntent)
    # Replace variables
    iMovesIntent.append(s+"|move." + tempIntent)

for s in iMovesIntent:
    for move in moves:
        # parse move
        parts = move.split(SEP)
        pieceCode = parts[0]
        fromColChar = parts[1][0]
        fromRowChar = parts[1][1]
        toColChar = parts[2][0]
        toRowChar = parts[2][1]
        # find localized wording
        piece = pieces[pcodes.index(pieceCode)]
        fromCol = cols[alphabet.index(fromColChar)]
        fromRow = rows[numerals.index(fromRowChar)]
        toCol = cols[alphabet.index(toColChar)]
        toRow = rows[numerals.index(toRowChar)]
        # Replace variables
        res = s.format(
            piece=piece,
            fromCol=fromCol,
            fromRow=fromRow,
            toCol=toCol,
            toRow=toRow
        )
        # write to file
        tf.write(mayStripSpaces(res, doStripSpaces)+"\n")

# all other simple intents / sentences (no parameters)

# append intents to simple strings which have no parameters
iCastlingKingside = addIntent(iCastlingKingside, "castling.kingside")
iCastlingQueenside = addIntent(iCastlingQueenside, "castling.queenside")
iDrawOffer = addIntent(iDrawOffer, "command.drawoffer")
iDrawAccept = addIntent(iDrawAccept, "command.drawaccept")
iIgnored = addIntent(iIgnored, "ignored")
iCommandUndo = addIntent(iCommandUndo, "command.undo")
iCommandPlayBlack = addIntent(iCommandPlayBlack, "command.playblack")
iCommandPlayWhite = addIntent(iCommandPlayWhite, "command.playwhite")
iCommandReset = addIntent(iCommandReset, "command.reset")
iCommandFinish = addIntent(iCommandFinish, "command.finish")
iCommandReplay = addIntent(iCommandReplay, "command.replay")
iCommandHelp = addIntent(iCommandHelp, "command.help")
iCommandHint = addIntent(iCommandHint, "command.hint")
iCommandMicOff = addIntent(iCommandMicOff, "command.micoff")
iCommandDisconnect = addIntent(iCommandDisconnect, "command.disconnect")
iCommandPlayComputer = addIntent(iCommandPlayComputer, "command.computer")

tAllSentences = iCommandDifficulty + \
    iCommandJoinRoom + iCastlingKingside + \
    iCastlingQueenside + iDrawOffer + iDrawAccept + iIgnored + \
    iCommandUndo + iCommandPlayBlack + iCommandPlayWhite + \
    iCommandReset + iCommandFinish + iCommandReplay + iCommandHelp + \
    iCommandHint + iCommandMicOff + iCommandDisconnect + iCommandPlayComputer

for s in tAllSentences:
    tf.write(mayStripSpaces(s, doStripSpaces)+"\n")

tf.close()

# ----------------------------------------
# Clean duplicates & sort
# ----------------------------------------

# open the temporary file for utf-8 reading
ft = open(fnTemp, "r", encoding="utf-8")
lines = ft.readlines()
lines_set = sorted(set(lines))  # create a sorted list without duplicates
ft.close()

# ----------------------------------------
# Create utf-8 .txt file for Language Model training
# ----------------------------------------
fTxt = open(fnTxt, "w", encoding="utf-8")
for line in lines_set:
    fTxt.write(line.split(SEP)[0]+"\n")  # only take sentence part
fTxt.close()

# ----------------------------------------
# JSON format for client data
# ----------------------------------------
# combine sentences
tAllSentences = iMovesIntent + tAllSentences

# split sentences & intents
allSentences = []
allIntents = []
for s in tAllSentences:
    arr = s.split(SEP)
    allSentences.append(arr[0])
    allIntents.append(arr[1])


jObj = {
    "code": lCode,
    "name": lName,
    "nativeName": lNativeName,
    "enabled": 1,
    "rowNames": rows,
    "colNames": cols,
    "pieceNames": pieces,
    "pieceCodes": pcodes,
    "sentences": allSentences,
    "intents": allIntents,
}

jStr = (str(jObj)).replace("\'", "\"")
jParsed = json.loads(jStr)

fJson = open(fnJson, "w", encoding="utf-8")
fJson.write(json.dumps(jParsed, indent=4, ensure_ascii=False))
fJson.close()
