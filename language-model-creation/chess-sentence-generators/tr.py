# voice-chess application language model sentence generator

# IMPORTANT: Only use lowercase characters. Unicode lower conversions can cause problems.
# They are totally unnecessary, steal CPU cycles and code space.

import json
from _common import getChessMoves, mayStripSpaces, writeToFile, addIntent
from _common import possibleMoveIntents, promotionOptions

########################################
# LOCALIZE THESE
########################################
lCode = "tr"
lName = "Turkish"
lNativeName = "Türkçe"

# chess piece colors
colors = ["siyah", "beyaz"]
# chess piece names, include name alternatives (such as Rook and Castle in English)
pieces = ["şah", "vezir", "kale", "fil", "at", "piyon"]
# you need to specify what that means in chess as some languages have multiple names for some pieces.
# here is the coding format: # KING: k, QUEEN: q, ROOK: r, BISHOP: b, KNIGHT: n, PAWN: p
pcodes = ["k", "q", "r", "b", "n", "p"]
# chess cols - localized characters [A-H] as strings - DO NOT CHANGE THIS, SIMPLE CHARS DO NOT WORK
cols = ["alpha", "bravo", "charlie", "delta",
        "echo", "foxtrot", "golf", "hotel"]
# chess rows - localized numbers [1-8] as strings
rows = ["bir", "iki", "üç", "dört", "beş", "altı", "yedi", "sekiz"]

# LANGUAGE IS DEVIDED INTO INTENTS, WHICH WILL BE PROCESSED BY THE CLIENT

# MOVE INTENTS are for piece moving
# possible movement/capture formats - write anything possible here
# ex: "move {piece} from {fromCol}{fromRow} to {toCol}{toRow}"
iMove = [
    # moves
    # kale alphabirden alphayediye gider
    "{piece} {fromCol}{fromRow}{fromSuffix} {toCol}{toRow}{toSuffix} gider",
    # kale alphabirden alphayediye
    "{piece} {fromCol}{fromRow}{fromSuffix} {toCol}{toRow}{toSuffix}",
    "{piece} {toCol}{toRow}{toSuffix}",  # kale alphayediye
    # alphabirden alphayediye
    "{fromCol}{fromRow}{fromSuffix} {toCol}{toRow}{toSuffix}",
    # alphabirdeki kale alphayediye gider
    "{fromCol}{fromRow}{atSuffix} {piece} {toCol}{toRow}{toSuffix} gider",
    # alphabirdeki kale alphayediye gider
    "{fromCol}{fromRow}{atSuffix} {piece} {toCol}{toRow}{toSuffix}",
    "{piece} {toCol}{toRow}{toSuffix} gider",  # kale alphayediye gider
    # kaleyi alphayediye götür
    "{piece}{pieceSuffix} {toCol}{toRow}{toSuffix} götür",
    "{piece} {toCol}{toRow}{toSuffix}",  # kale alphayediye
    "{fromCol}{fromRow} {toCol}{toRow}",  # alphabir alphayedi
    "{toCol}{toRow}",  # alphayedi
    # beyaz kale alphayediye gider
    "beyaz {piece} {toCol}{toRow}{toSuffix} gider",
    # siyah kale alphayediye gider
    "siyah {piece} {toCol}{toRow}{toSuffix} gider",
    "beyaz {piece} {toCol}{toRow}{toSuffix}",  # beyaz kale alphayediye
    "siyah {piece} {toCol}{toRow}{toSuffix}",  # siyah kale alphayediye

    # captures
    # alphabirdeki kale alphayediye
    "{fromCol}{fromRow}{atSuffix} {piece} {toCol}{toRow}{toSuffix}",
    # alphabirdeki kale alphayediyi alır
    "{fromCol}{fromRow}{atSuffix} {piece} {toCol}{toRow}{towardsSuffix} alır",
    # kale alphabirden alfayediyi alır
    "{piece} {fromCol}{fromRow}{fromSuffix} {toCol}{toRow}{towardsSuffix} alır",
    "{piece} {toCol}{toRow}{towardsSuffix} alır",  # kale alfayediyi alır
    "{piece} {piece}{pieceSuffix} alır",  # kale piyonu alır
    # kale alphayedideki piyonu alır
    "{piece} {toCol}{toRow}{atSuffix} {piece}{pieceSuffix} alır",
    "{toCol}{toRow}{towardsSuffix} al",  # alphayediyi al
]

# Promotions
iPromotion = [
    "{piece}{pieceToSuffix} yükselt",  # vezire yükselt
    "{piece}{pieceToSuffix} terfi ettir",  # vezire terfi ettir
    "{piece} yap",  # vezir yap
]

# KINGSIDE/QUEENSIDE CASTLING INTENTS
iCastlingKingside = ["şah kanadı rok"]
iCastlingQueenside = ["vezir kanadı rok"]

# RESIGN INTENTS
iResign = ["çekiliyorum", "terk ediyorum",
           "siyah terk eder", "beyaz terk eder"]

# OFFER/ACCEPT DRAW INTENTS
iDrawOffer = ["beraberlik öneriyorum", "pat öneriyorum"]
iDrawAccept = ["beraberlik önerisini kabul ediyorum",
               "beraberliği onaylıyorum"]

# IGNORED INTENTS
iIgnored = ["şah", "şah mat", "beraberlik", "pat"]

# GAME COMMAND INTENTS
iCommandUndo = ["geri al", "iptal"]
iCommandPlayBlack = ["siyah oyna"]
iCommandPlayWhite = ["beyaz oyna"]
iCommandReset = ["oyunu sıfırla"]
iCommandFinish = ["oyunu bitir"]
iCommandReplay = ["yeniden oynat"]
iCommandHelp = ["yardım", "yardımı göster"]
iCommandHint = ["ipucu", "ipucu ver"]
iCommandMicOff = ["mikrofonu kapat", "mikrofon kapalı"]
iCommandDisconnect = ["bağlantıyı kes", "sunucu bağlantısını kes"]
iCommandPlayComputer = ["bilgisayara karşı oyna"]

# with numbers
iCommandDifficulty = [
    "zorluk {number}",
    "zorluk seviyesi {number}",
    "zorluk seviyesini {number} yap",
    "zorluk seviyesini {number} olarak ayarla",
]
iCommandJoinRoom = [
    "oda {number} katıl",
    "oda {number} oyna",
]


# Turkish Specific from/to suffixes go after the number
# REF: pieces = ["Şah", "Vezir", "Kale", "Fil", "At", "Piyon"]
# REF: rows = ["bir", "iki", "üç", "dört", "beş", "altı", "yedi", "sekiz"]
pieceSuffixes = ["ı", "i", "yi", "i", "ı", "u"]
pieceToSuffixes = ["a", "e", "ye", "e", "a", "a"]
fromSuffixes = ["den", "den", "den", "den", "den", "dan", "den", "den"]
toSuffixes = ["e", "ye", "e", "e", "e", "ya", "ye", "e"]
atSuffixes = ["deki", "deki", "deki", "deki", "deki", "daki", "deki", "deki"]
towardsSuffixes = ["i", "yi", "ü", "ü", "i", "yı", "yi", "i"]

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
        tf.write(mayStripSpaces(s.format(number=number), doStripSpacesInParametric)+"\n")
    for s in iCommandJoinRoom:
        tf.write(mayStripSpaces(s.format(number=number), doStripSpacesInParametric)+"\n")

# Promotions - append intents
iPromotion = addIntent(iPromotion, "promotion")
for p in promotionOptions:
    for s in iPromotion:
        piece = pieces[pcodes.index(p)]  # get localized piecename
        pieceToSuffix = pieceToSuffixes[pcodes.index(p)]
        # replace parameters
        res = s.format(piece=piece, pieceToSuffix=pieceToSuffix)
        tf.write(mayStripSpaces(res, doStripSpacesInParametric)+"\n")  # write to file

# Algorithm:
# Loop: For each sentence
# Loop: For each possible move in "moves"
# Get localized wording (piece, row and column names)
# Replace {x} in the sentence with respective words and output the result
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
        # suffixes
        pieceSuffix = pieceSuffixes[pcodes.index(pieceCode)]
        pieceToSuffix = pieceToSuffixes[pcodes.index(pieceCode)]
        fromSuffix = fromSuffixes[numerals.index(fromRowChar)]
        toSuffix = toSuffixes[numerals.index(toRowChar)]
        atSuffix = atSuffixes[numerals.index(toRowChar)]
        towardsSuffix = towardsSuffixes[numerals.index(toRowChar)]
        # Replace variables
        res = s.format(
            piece=piece, pieceSuffix=pieceSuffix, pieceToSuffix=pieceToSuffix,
            fromCol=fromCol, fromRow=fromRow, fromSuffix=fromSuffix,
            toCol=toCol, toRow=toRow, toSuffix=toSuffix,
            atSuffix=atSuffix, towardsSuffix=towardsSuffix
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
json.dump(jParsed, fJson, indent=4, ensure_ascii=False)
fJson.close()
