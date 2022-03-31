# HELPER FUNCTIONS FOR ALL LOCALES

# CONSTANTS

possibleMoveIntents = [
    "001",  # echofour
    "011",  # move echotwo to echofour
    "101",  # pawn to echofour
    "111",  # move pawn from echotwo to echofour
    "200",  # bishop takes pawn
    "201",  # bishop takes pawn at echofive
    "210",  # bishop at echofive takes pawn
    "211"   # pawn at echofour takes pawn at deltafive
]

promotionOptions = ["q", "r", "b", "n"]


# function to get list of all possible chess moves from file


def getChessMoves(fn):
    with open(fn) as f:
        moves = f.readlines()
    return moves

# we might strip spaces


def mayStripSpaces(s, cond=False):
    if cond:
        s = s.replace(" ", "")
    return s

# function to handle non-parametric sentences


def writeToFile(f, list, strip=False):
    for s in list:
        f.write(mayStripSpaces(s, strip)+"\n")

# function to add intent to all elements in list


def addIntent(lst, intent):
    lst[:] = [x + "|" + intent for x in lst]
    return lst
