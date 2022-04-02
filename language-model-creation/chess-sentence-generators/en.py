
# voice-chess application language model sentence generator

# IMPORTANT: Only use lowercase characters. Unicode lower conversions can cause problems.
# They are totally unnecessary, steal CPU cycles and code space.

import json
from _common import getChessMoves, mayStripSpaces, writeToFile, addIntent
from _common import possibleMoveIntents, promotionOptions

########################################
# LOCALIZE THESE
########################################
lCode = "en"
lName = "English"
lNativeName = "English"

# chess piece colors ["black", "white"]
colors = ["black", "white"]
# chess piece names, include name alternatives (such as Rook and Castle in English)
pieces = ["king", "queen", "rook", "castle", "bishop", "knight", "pawn"]
# you need to specify what that means in chess as some languages have multiple names for some pieces.
# here is the coding format: # KING: k, QUEEN: q, ROOK: r, BISHOP: b, KNIGHT: n, PAWN: p
pcodes = ["k", "q", "r", "r", "b", "n", "p"]
# chess cols - localized characters [A-H] as strings - DO NOT CHANGE THIS, SIMPLE CHARS DO NOT WORK
cols = ["alpha", "bravo", "charlie", "delta",
        "echo", "foxtrot", "golf", "hotel"]
# chess rows - localized numbers [1-8] as strings
rows = ["one", "two", "three", "four", "five", "six", "seven", "eight"]

# LANGUAGE IS DEVIDED INTO INTENTS, WHICH WILL BE PROCESSED BY THE CLIENT

# MOVE INTENTS are for piece moving
# possible movement/capture formats - write anything possible here
# ex: "move {piece} from {fromCol}{fromRow} to {toCol}{toRow}"
iMove = [
    # moves
    "move {piece} from {fromCol}{fromRow} to {toCol}{toRow}",
    "move {fromCol}{fromRow} to {toCol}{toRow}",
    "move to {toCol}{toRow}",
    "{piece} at {fromCol}{fromRow} to {toCol}{toRow}",
    "{piece} at {fromCol}{fromRow} moves to {toCol}{toRow}",
    "{piece} moves to {toCol}{toRow}",
    "{piece} to {toCol}{toRow}",
    "{fromCol}{fromRow} {toCol}{toRow}",
    "{toCol}{toRow}",
    "white {piece} to {toCol}{toRow}",
    "black {piece} to {toCol}{toRow}",
    # captures
    "{piece} {fromCol}{fromRow} takes {toCol}{toRow}",
    "{piece} {fromCol}{fromRow} captures {toCol}{toRow}",
    "{piece} takes {toCol}{toRow}",
    "{piece} captures {toCol}{toRow}",
    "{piece} at {fromCol}{fromRow} takes {piece}",
    "{piece} at {fromCol}{fromRow} captures {piece}",
    "{piece} takes {piece}",
    "{piece} captures {piece}",
    "{piece} takes {piece} at {toCol}{toRow}",
    "{piece} captures {piece} at {toCol}{toRow}",
    "take {toCol}{toRow}",
    "capture {toCol}{toRow}",
]

# Promotions
iPromotion = ["promote to {piece}"]

# KINGSIDE/QUEENSIDE CASTLING INTENTS
iCastlingKingside = ["kingside castling"]
iCastlingQueenside = ["queenside castling"]

# RESIGN INTENTS
iResign = ["i resign", "black resigns", "white resigns"]

# OFFER/ACCEPT DRAW INTENTS
iDrawOffer = ["i offer draw"]
iDrawAccept = ["i accept draw"]

# IGNORED INTENTS
iIgnored = ["check", "checkmate", "stalemate"]

# GAME COMMAND INTENTS
iCommandUndo = ["undo", "undo move", "take back"]
iCommandPlayBlack = ["play black"]
iCommandPlayWhite = ["play white"]
iCommandReset = ["reset game"]
iCommandFinish = ["finish game"]
iCommandReplay = ["replay game"]
iCommandHelp = ["help", "show help"]
iCommandHint = ["hint", "show hint"]
iCommandMicOff = ["microphone off"]
iCommandDisconnect = [
    "disconnect",
    "disconnect server",
    "disconnect from server"
]
iCommandPlayComputer = ["play against computer"]

# with numbers (1-8)
iCommandDifficulty = [
    "difficulty {number}",
    "difficulty level {number}",
    "set difficulty to {number}",
    "level {number}",
    "set level to {number}",
    "set difficulty level to {number}"
]
iCommandJoinRoom = [
    "join room {number}",
    "join game {number}",
    "play in room {number}"
]

########################################
# PARAMETERS - FOR EXPERIMENTING
########################################

doStripSpacesInParametric = False   # Default false to prevent large LM
doStripSpacesInSimple = True        # Default true to prevent LM pollution

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
        tf.write(mayStripSpaces(s.format(number=number),
                 doStripSpacesInParametric)+"\n")
    for s in iCommandJoinRoom:
        tf.write(mayStripSpaces(s.format(number=number),
                 doStripSpacesInParametric)+"\n")

# Promotions - append intents
iPromotion = addIntent(iPromotion, "promotion")
for p in promotionOptions:
    for s in iPromotion:
        piece = pieces[pcodes.index(p)]  # get localized piecename
        res = s.format(piece=piece)  # replace parameter
        # write to file
        tf.write(mayStripSpaces(res, doStripSpacesInParametric)+"\n")


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
        tf.write(mayStripSpaces(res, doStripSpacesInParametric)+"\n")

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

tSimpleSentences = iCastlingKingside + iCastlingQueenside + \
    iDrawOffer + iDrawAccept + iIgnored + \
    iCommandUndo + iCommandPlayBlack + iCommandPlayWhite + \
    iCommandReset + iCommandFinish + iCommandReplay + iCommandHelp + \
    iCommandHint + iCommandMicOff + iCommandDisconnect + iCommandPlayComputer

for s in tSimpleSentences:
    tf.write(mayStripSpaces(s, doStripSpacesInSimple)+"\n")

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
tAllSentences = tSimpleSentences + \
    iCommandDifficulty + iCommandJoinRoom + iMovesIntent

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
