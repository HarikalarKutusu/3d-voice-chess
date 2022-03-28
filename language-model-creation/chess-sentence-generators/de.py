# voice-chess application language model sentence generator

# IMPORTANT: Only use lowercase characters. Unicode lower conversions can cause problems.
# They are totally unnecessary, steal CPU cycles and code space.

########################################
# LOCALIZE THESE
########################################
languageCode = "de"

# chess piece colors
colors = ["swarz", "weiss"]
# chess piece names
pieces = ["koenig", "dame", "turm", "laeufer", "springer", "bauer"]
# you need to specify what that means in chess as some languages have multiple names for some pieces.
# here is the coding format: # KING: k, QUEEN: q, ROOK: r, BISHOP: b, KNIGHT: n, PAWN: p
pcodes = ["k", "q", "r", "b", "n", "p"]
# chess cols - localized characters [A-H] as strings - DO NOT CHANGE THIS, SIMPLE CHARS DO NOT WORK
cols = ["alpha", "bravo", "charlie", "delta", "echo", "foxtrot", "golf", "hotel"]
# chess rows - localized numbers [1-8] as strings - 8 tokens
rows = ["eins", "zwei", "drei", "vier", "fuenf", "sechs", "sieben", "acht"]

# possible sentence formats - write anything possible here, like "move {piece} from {fromCol}{fromRow} to {toCol}{toRow}"
sentenceTemplates = [
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
    "Bauernumwandlung zur {piece}",
    "Bauernumwandlung zum {piece}",
  ]

# these are standard wording without parameters
sentencesSpecial = [
    "ich gebe auf", "schwarz gibt auf", "weiss gibt auf",
    "schach", "matt", "patt",
    "rochade am koenigsfluegel", "rochade am damenfluegel", "koenigsfluegel rochade", "damenfluegel rochade"
  ]
# these are voice commands to be spoken to the client software
commands = [
    "rueckgehen", "bewegung rueckgaengig machen", "zuruecknehmen", "nehme zurueck", "zurueckbringen",
    "schwarz spielen", "weiss spielen", "zuruecksetzen", "spiel zuruecksetzen", "spiel beenden", "spiel wiederholen"
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
