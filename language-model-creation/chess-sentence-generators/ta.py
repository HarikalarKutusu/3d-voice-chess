# voice-chess application language model sentence generator

# IMPORTANT: Only use lowercase characters. Unicode lower conversions can cause problems.
# They are totally unnecessary, steal CPU cycles and code space.

import json
from _common import getChessMoves, mayStripSpaces, writeToFile, addIntent
from _common import possibleMoveIntents, promotionOptions

########################################
# LOCALIZE THESE
########################################
lCode = "ta"
lName = "Tamil"
lNativeName = "தமிழ்"

# chess piece colors
colors = ["கருப்பு", "வெள்ளை"]
# chess piece names, include name alternatives (such as Rook and Castle in English). Removing word ending dot character so suffixes can be attached
# pieces = ["அரசன்", "அரசி", "கோட்டை", "மந்திரி", "குதிரை", "படைவீரன்","ராணி","ராஜா","சிப்பாய்"]
pieces = ["அரசன", "அரசி", "கோட்டை", "மந்திரி", "குதிரை", "படைவீரன","ராணி","ராஜா","சிப்பாய"]
# you need to specify what that means in chess as some languages have multiple names for some pieces.
# here is the coding format: # KING: k, QUEEN: q, ROOK: r, BISHOP: b, KNIGHT: n, PAWN: p
pcodes = ["k", "q", "r", "b", "n", "p","q","k","p"]
# pcodes = ["கெ", "குவி", "ஆர்", "மி", "என்", "பி"]
# chess cols - localized characters [A-H] as strings - DO NOT CHANGE THIS, SIMPLE CHARS DO NOT WORK
cols = ["alpha", "beta", "charlie", "delta",
        "echo", "foxtrot", "golf", "hotel"]
# cols = ["ஆல்பா", "பிராவோ", "சார்லி", "டெல்டா",
        # "டெல்டா", "போஸ்ட்ரோட்", "கோல்ப்", "ஹோட்டல்"]
# chess rows - localized numbers [1-8] as strings
# rows = ["ஒன்று" "இரண்டு", "மூன்று", "நான்கு", "ஐந்து", "ஆறு", "ஏழு", "எட்டு"]
rows = ["one", "two", "three", "four", "five", "six", "seven", "eight"]

# LANGUAGE IS DEVIDED INTO INTENTS, WHICH WILL BE PROCESSED BY THE CLIENT

# MOVE INTENTS are for piece moving
# possible movement/capture formats - write anything possible here
# ex: "move {piece} from {fromCol}{fromRow} to {toCol}{toRow}"
iMove = [
    # moves
    # alpha one இலிருந்து alpha two க்கு ராஜாவை நகர்த்தவும்
    # alpha one suffix alpha two suffix king suffix move
    "{fromCol}{fromRow}{fromSuffix} {toCol}{toRow}{toSuffix} {piece}{pieceSuffix} நகர்த்தவும்",
    #ராஜாவை alpha one இலிருந்து alpha two க்கு நகர்த்தவும்
    #rajawai Alphaone iliruntu alphaseven kku  nakarttavum
    "{piece}{pieceSuffix} {fromCol}{fromRow}{fromSuffix} {toCol}{toRow}{toSuffix} நகர்த்தவும்",
    # alpha one இலிருந்து alpha two க்கு
    "{fromCol}{fromRow}{fromSuffix} {toCol}{toRow}{toSuffix}",

    # alpha இலிருந்து alpha two க்கு
    "{fromCol}{fromSuffix} {toCol}{toRow}{toSuffix}",
    
    # ராஜாவை A2 க்கு நகர்த்தவும்
    # king suffix A2 suffix move
    "{piece}{pieceSuffix} {toCol}{toRow}{toSuffix} நகர்த்தவும்",  # kale alphayediye gider
    # ராஜாவை A2 க்கு
    # king suffix A2 suffix
    "{piece}{pieceSuffix} {toCol}{toRow}{toSuffix}",
    # ராஜா A2 
    # king A2
    "{piece} {toCol}{toRow}",

    "{fromCol}{fromRow} {toCol}{toRow}",  # alphaone alphatwo
    "{toCol}{toRow}",  # alphatwo
    # கருப்பு ராஜாவை alpha two க்கு நகர்த்தவும்
    # black king alpha two suffix move
    "கருப்பு {piece}{pieceSuffix} {toCol}{toRow}{toSuffix} நகர்த்தவும்",
    # கருப்பு ராஜாவை alpha two க்கு
    # black king alpha two suffix
    "கருப்பு {piece}{pieceSuffix} {toCol}{toRow}{toSuffix}",

    # வெள்ளை ராஜாவை alpha two க்கு நகர்த்தவும்
    # white king alpha two suffix move
    "வெள்ளை {piece}{pieceSuffix} {toCol}{toRow}{toSuffix} நகர்த்தவும்",
    # வெள்ளை ராஜாவை alpha two க்கு
    # white king alpha two suffix
    "வெள்ளை {piece}{pieceSuffix} {toCol}{toRow}{toSuffix}",
    # வெள்ளை ராஜா alpha two
    # white king alpha two
    "வெள்ளை {piece} {toCol}{toRow}",


    # # captures

    # Pawn
    # C4 ஐ B உடன் எடுத்துக் கொள்ளுங்கள்
    # C4 suffix B with take do
    "{toCol}{toRow}ஐ {fromCol}உடன் எடுத்துக் கொள்ளுங்கள்",    

    # piece
    # ரூக்குடன் charlie four ஐ எடுத்துக் கொள்ளுங்கள்
    # rook suffix charlie four suffix take do
    "{piece}{pieceCaptureSuffix}{toCol}{toRow}ஐ எடுத்துக் கொள்ளுங்கள்",
]

# Promotions
# ராணியாக மாற்றவும்
# queen-as change
iPromotion = [
    "{piece}{pieceAsSuffix} மாற்றவும்",
]

# KINGSIDE/QUEENSIDE CASTLING INTENTS

# arasannukku arasanpakkam maraividam erpaduttudal
# king-to king-side closet arrangement causing
# arasannukku arasipakkam maraividam erpaduttudal
# king-to queen-side closet arrangement causing
# See:https://youtu.be/y_DkIaIMQQg?t=116, 1:56

iCastlingKingside = ["அரசன்பக்கம் மறைவிடம் ஏற்படுத்துதல்"]
iCastlingQueenside = ["அரசிபக்கம் மறைவிடம் ஏற்படுத்துதல்"]

# RESIGN INTENTS
iResign = ["resign"]

# OFFER/ACCEPT DRAW INTENTS
iDrawOffer = ["draw"]
iDrawAccept = ["accept draw",
                ]


# IGNORED INTENTS
# iIgnored = ["şah", "şah mat", "beraberlik", "pat"]

# GAME COMMAND INTENTS
iCommandUndo = ["undo"]
iCommandPlayBlack = ["play black"]
iCommandPlayWhite = ["play white"]
iCommandReset = ["reset"]
iCommandFinish = ["finish"]
iCommandReplay = ["replay"]
iCommandHelp = ["help", "உதவி"]
iCommandHint = ["hint"]
iCommandMicOff = ["mic off"]
iCommandDisconnect = ["disconnect"]
iCommandPlayComputer = ["play computer"]

## with numbers
iCommandDifficulty = [
    "difficulty {number}",
    "difficulty number {number}",
]
iCommandJoinRoom = [
    "join room {number}",
    "join room number {number}",
]


# Tamil Specific from/to suffixes go after the number யாக ாக
# FIND A WAY TO REMOVE DOT FROM END OF PIECE-WORDS
# REF: pieces = ["அரசன்", "அரசி", "கோட்டை", "மந்திரி", "குதிரை", "படைவீரன்","ராணி","ராஜா","சிப்பாய்"]
pieceSuffixes = ["ை", "யை", "யை", "யை", "யை", "ை","யை","யை","ை"]
pieceAsSuffixes = ["ாக", "யாக", "யாக", "யாக", "யாக", "ாக","யாக","யாக","ாக"]
pieceCaptureSuffixes = ["ுடன்", "யுடன்", "யுடன்", "யுடன்", "யுடன்", "ுடன்","யுடன்","யுடன்","ுடன்"]
fromSuffixes = ["இலிருந்து", "இலிருந்து", "இலிருந்து", 
                "இலிருந்து", "இலிருந்து", "இலிருந்து", "இலிருந்து", "இலிருந்து"]
toSuffixes = ["க்கு", "க்கு", "க்கு", "க்கு", "க்கு", "க்கு", "க்கு", "க்கு"]
pieceCaptureSuffixes = ["ுடன்", "யுடன்", "யுடன்", "யுடன்", "யுடன்", 
                        "ுடன்","யுடன்","யுடன்","ுடன்"]

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
        piece = pieces[pcodes.index(p)]
        pieceAsSuffix = pieceAsSuffixes[pcodes.index(p)]
        # replace parameters
        res = s.format(piece=piece, pieceAsSuffix=pieceAsSuffix)
        tf.write(mayStripSpaces(res, doStripSpacesInParametric)+"\n")  # write to file

## Algorithm:
## Loop: For each sentence
## Loop: For each possible move in "moves"
## Get localized wording (piece, row and column names)
## Replace {x} in the sentence with respective words and output the result
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
        parts = move.split('\n')[0].split(SEP)
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
        # rows = ["one", "two", "three", "four", "five", "six", "seven", "eight"]
        # numerals = ["1", "2", "3", "4", "5", "6", "7", "8"]
        toRow = rows[numerals.index(toRowChar)]        # suffixes
        pieceSuffix = pieceSuffixes[pcodes.index(pieceCode)]
        pieceCaptureSuffix = pieceCaptureSuffixes[pcodes.index(pieceCode)]
        pieceAsSuffix = pieceAsSuffixes[pcodes.index(pieceCode)]
        fromSuffix = fromSuffixes[numerals.index(fromRowChar)]
        toSuffix = toSuffixes[numerals.index(toRowChar)]
        
        ## Replace variables

        res = s.format(
            piece=piece, pieceSuffix=pieceSuffix, pieceAsSuffix=pieceAsSuffix,
            fromCol=fromCol, fromRow=fromRow, fromSuffix=fromSuffix,
            toCol=toCol, toRow=toRow, 
            toSuffix=toSuffix,pieceCaptureSuffix=pieceCaptureSuffix
        )
        ## write to file
        tf.write(mayStripSpaces(res, doStripSpacesInParametric)+"\n")

# all other simple intents / sentences (no parameters)

# append intents to simple strings which have no parameters
print(iCastlingKingside)
iCastlingKingside = addIntent(iCastlingKingside, "castling.kingside")
iCastlingQueenside = addIntent(iCastlingQueenside, "castling.queenside")
iDrawOffer = addIntent(iDrawOffer, "command.drawoffer")
iDrawAccept = addIntent(iDrawAccept, "command.drawaccept")
# iIgnored = addIntent(iIgnored, "ignored")
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
    iDrawOffer + iDrawAccept  + \
    iCommandUndo + iCommandPlayBlack + iCommandPlayWhite + \
    iCommandReset + iCommandFinish + iCommandReplay + iCommandHelp + \
    iCommandHint + iCommandMicOff + iCommandDisconnect + iCommandPlayComputer

for s in tSimpleSentences:
    tf.write(mayStripSpaces(s, doStripSpacesInSimple)+"\n")

tf.close()

# # ----------------------------------------
# # Clean duplicates & sort
# # ----------------------------------------

# open the temporary file for utf-8 reading
ft = open(fnTemp, "r", encoding="utf-8")
lines = ft.readlines()
lines_set = sorted(set(lines))  # create a sorted list without duplicates
ft.close()

# # ----------------------------------------
# # Create utf-8 .txt file for Language Model training
# # ----------------------------------------
fTxt = open(fnTxt, "w", encoding="utf-8")
for line in lines_set:
    fTxt.write(line.split(SEP)[0]+"\n")  # only take sentence part
fTxt.close()

# # ----------------------------------------
# # JSON format for client data
# # ----------------------------------------
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