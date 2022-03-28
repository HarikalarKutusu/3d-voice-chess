# voice-chess application language model sentence generator

# IMPORTANT: Only use lowercase characters. Unicode lower conversions can cause problems.
# They are totally unnecessary, steal CPU cycles and code space.

########################################
# LOCALIZE THESE
########################################
languageCode = "en"

# chess piece colors
colors = ["black", "white"]
# chess piece names, include name alternatives (such as Rook and Castle in English)
pieces = ["king", "queen", "rook", "castle", "bishop", "knight", "pawn"]
# you need to specify what that means in chess as some languages have multiple names for some pieces.
# here is the coding format: # KING: k, QUEEN: q, ROOK: r, BISHOP: b, KNIGHT: n, PAWN: p
pcodes = ["k", "q", "r", "r", "b", "n", "p"]
# chess cols - localized characters [A-H] as strings - DO NOT CHANGE THIS, SIMPLE CHARS DO NOT WORK
cols = ["alpha", "bravo", "charlie", "delta", "echo", "foxtrot", "golf", "hotel"]
# chess rows - localized numbers [1-8] as strings
rows = ["one", "two", "three", "four", "five", "six", "seven", "eight"]

# possible sentence formats - write anything possible here, like "move {piece} from {fromCol}{fromRow} to {toCol}{toRow}"
sentenceTemplates = [
    # moves
    "move {piece} from {fromCol}{fromRow} to {toCol}{toRow}",
    "move {fromCol}{fromRow} to {toCol}{toRow}",
    "move to {toCol}{toRow}",
    "{piece} at {fromCol}{fromRow} to {toCol}{toRow}",
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
    "promote to {piece}",
  ]
# these are standard wording without parameters
sentencesSpecial = [
    "i resign", "black resigns", "white resigns",
    "check", "checkmate", "stalemate",
    "kingside castle", "queenside castle", "kingside castling", "queenside castling"
]
# these are voice commands to be spoken to the client software
commands = [
    "undo", "undo move", "take back",
    "play black", "play white", "reset game", "finish game", "replay game"
]

########################################
# PARAMETERS - FOR EXPERIMENTING
########################################

doStripSpaces = False

#############################################################################################
# GENERATOR CODE, DO NOT TOUCH UNLESS YOUR LANGUAGE REQUIRES SPECIAL HANDLING (e.g. suffixes)
#############################################################################################
alphabet = ["a", "b", "c", "d", "e", "f", "g", "h"]
numerals = ["1", "2", "3", "4", "5", "6", "7", "8"]
SEP = "|"

# get list of all possible chess moves from file
filename = "chess-moves.txt"
with open(filename) as f:
    moves = f.readlines()

# ----------------------------------------
# Main Generator - loop every combination
# ----------------------------------------

# open a temporary file for utf-8 writing
tf = open(languageCode+".tmp", "w", encoding="utf-8")

# Algorithm:
# Loop: For each sentence
# Loop: For each possible move in "moves"
# Get localized wording (piece, row and column names)
# Replace {x} in the sentence with respective words and output the result

for s in sentenceTemplates:
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
        str = s.format(piece=piece, fromCol=fromCol,
                       fromRow=fromRow,  toCol=toCol, toRow=toRow)
        # additional work depending on set parameters
        if doStripSpaces:
            str = str.replace(" ", "")
        tf.write(str+"\n")

# single sentences
for s in sentencesSpecial:
    if doStripSpaces:
        s = s.replace(" ", "")
    tf.write(s+"\n")

# commands
for s in commands:
    if doStripSpaces:
        s = s.replace(" ", "")
    tf.write(s+"\n")

tf.close()

# ----------------------------------------
# Clean duplicates & sort
# ----------------------------------------

# open the temporary file for utf-8 reading
lines = open(languageCode+".tmp", "r", encoding="utf-8").readlines()
lines_set = set(lines)

# open the final file for utf-8 writing
f = open(languageCode+".txt", "w", encoding="utf-8")
for line in sorted(lines_set):
    f.write(line)

f.close()
