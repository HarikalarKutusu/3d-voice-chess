# voice-chess application language model sentence generator

# IMPORTANT: Only use lowercase characters. Unicode lower conversions can cause problems.
# They are totally unnecessary, steal CPU cycles and code space.

########################################
# LOCALIZE THESE
########################################
languageCode = "tr"

# chess piece colors
colors = ["siyah", "beyaz"]
# chess piece names, include name alternatives (such as Rook and Castle in English)
pieces = ["şah", "vezir", "kale", "fil", "at", "piyon"]
# you need to specify what that means in chess as some languages have multiple names for some pieces.
# here is the coding format: # KING: k, QUEEN: q, ROOK: r, BISHOP: b, KNIGHT: n, PAWN: p
pcodes = ["k", "q", "r", "b", "n", "p"]
# chess cols - localized characters [A-H] as strings - DO NOT CHANGE THIS, SIMPLE CHARS DO NOT WORK
cols = ["alpha", "bravo", "charlie", "delta", "echo", "foxtrot", "golf", "hotel"]
# chess rows - localized numbers [1-8] as strings
rows = ["bir", "iki", "üç", "dört", "beş", "altı", "yedi", "sekiz"]

# possible sentence formats - write anything possible here, like "move {piece} from {fromCol}{fromRow} to {toCol}{toRow}"
sentenceTemplates = [
    # moves
    "{piece} {fromCol}{fromRow}{fromSuffix} {toCol}{toRow}{toSuffix} gider", # kale alphabirden alphayediye gider
    "{piece} {fromCol}{fromRow}{fromSuffix} {toCol}{toRow}{toSuffix}", # kale alphabirden alphayediye
    "{piece} {toCol}{toRow}{toSuffix}", # kale alphayediye
    "{fromCol}{fromRow}{fromSuffix} {toCol}{toRow}{toSuffix}", # alphabirden alphayediye
    "{fromCol}{fromRow}{atSuffix} {piece} {toCol}{toRow}{toSuffix} gider", #alphabirdeki kale alphayediye gider
    "{fromCol}{fromRow}{atSuffix} {piece} {toCol}{toRow}{toSuffix}", #alphabirdeki kale alphayediye gider
    "{piece} {toCol}{toRow}{toSuffix} gider", # kale alphayediye gider
    "{piece}{pieceSuffix} {toCol}{toRow}{toSuffix} götür", # kaleyi alphayediye götür
    "{piece} {toCol}{toRow}{toSuffix}", # kale alphayediye
    "{fromCol}{fromRow} {toCol}{toRow}", #alphabir alphayedi
    "{toCol}{toRow}", # alphayedi
    "beyaz {piece} {toCol}{toRow}{toSuffix} gider", # beyaz kale alphayediye gider
    "siyah {piece} {toCol}{toRow}{toSuffix} gider", # siyah kale alphayediye gider
    "beyaz {piece} {toCol}{toRow}{toSuffix}", # beyaz kale alphayediye
    "siyah {piece} {toCol}{toRow}{toSuffix}", # siyah kale alphayediye

    # captures
    "{fromCol}{fromRow}{atSuffix} {piece} {toCol}{toRow}{toSuffix}", # alphabirdeki kale alphayediye
    "{fromCol}{fromRow}{atSuffix} {piece} {toCol}{toRow}{towardsSuffix} alır", # alphabirdeki kale alphayediyi alır
    "{piece} {fromCol}{fromRow}{fromSuffix} {toCol}{toRow}{towardsSuffix} alır", # kale alphabirden alfayediyi alır
    "{piece} {toCol}{toRow}{towardsSuffix} alır", # kale alfayediyi alır
    "{piece} {piece}{pieceSuffix} alır", # kale piyonu alır
    "{piece} {toCol}{toRow}{atSuffix} {piece}{pieceSuffix} alır", # kale alphayedideki piyonu alır
    "{toCol}{toRow}{towardsSuffix} al", # alphayediyi al
    "{piece}{pieceToSuffix} yükselt", # vezire yükselt
    "{piece}{pieceToSuffix} terfi ettir", # vezire terfi ettir
    "{piece} yap", # vezir yap
  ]
# these are standard wording without parameters
sentencesSpecial = [
    "çekiliyorum", "terk ediyorum", "siyah terk eder", "beyaz terk eder",
    "şah", "şah mat", "beraberlik", "pat",
    "şah kanadı rok", "vezir kanadı rok"
  ]
# these are voice commands to be spoken to the client software
commands = [
    "siyah oyna", "beyaz oyna", "geri al", "iptal", "oyunu sıfrla", "oyunu bitir", "yeniden oynat"
  ]

# Turkish Specific from/to suffixes go after the number
# REF: pieces = ["Şah", "Vezir", "Kale", "Fil", "At", "Piyon"]
# REF: rows = ["bir", "iki", "üç", "dört", "beş", "altı", "yedi", "sekiz"]
pieceSuffixes = ["ı", "i", "i", "i", "ı", "u"]
pieceToSuffixes = ["a", "e", "ye", "e", "a", "a"]
fromSuffixes = ["den", "den", "den", "den", "den", "dan", "den", "den"]
toSuffixes = ["e", "ye", "e", "e", "e", "ya", "ye", "e"]
atSuffixes = ["deki", "deki", "deki", "deki", "deki", "daki", "deki", "deki"]
towardsSuffixes = ["i", "yi", "ü", "ü", "i", "yı", "yi", "i"]

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

# Main Generator - loop every combination

# open a temporary file for utf-8 writing
tf = open(languageCode+".tmp", "w", encoding="utf-8")

# Algorithm:
# Loop: For each sentence
# Loop: For each possible move in "moves"
# Get localized wording (piece, row and column names)
# Replace {x} in the sentence with respective words and output the result

for sentence in sentenceTemplates:
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
        str = sentence.format(
            piece=piece, pieceSuffix=pieceSuffix, pieceToSuffix=pieceToSuffix,
            fromCol=fromCol, fromRow=fromRow, fromSuffix=fromSuffix,
            toCol=toCol, toRow=toRow, toSuffix=toSuffix,
            atSuffix=atSuffix, towardsSuffix=towardsSuffix
            )
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
