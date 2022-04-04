# Chess Sentence Generators

Simple python scripts for each language to generate raw sentences for the language model. We provided separate scripts as each language can have special needs and coding.

Contributors are expected to duplicate one of these files into their language code, translate it and/or expand it for chess jargon in their language.

Currently supported languages: de (German), en (English), tr (Turkish)

For many western languages you can start with English (en.py).

Turkish is another possibility to start with for languages where "to"/"from" are represented as suffixes.

Currently, in German we neglected Articles (der, die, das) and accusative forms (den, der, dem ...) for simplification. Also, Umlauts (ä, ö, ü) and scharfes S are written in their ASCII formats (ae, oe, ue, ss) for now, as they are not directly used as texts like in common ASR systems, but translated to chess notations. But this can be changed.

While playing the game, programmers and/or users can find additional and/or better sentences and these can be added to generate better language models.

## Algorithm

The algorithm is based on intents. Each sentence is a kind of command given to the system, with some intention, for the system to act on it. So we divided them into arrays of sentences, each representing an intent. The array content is flexible, a language can have multiple ways of saying it.

The scripts result into two outputs (under the .out directory):

- A .txt file, containing all possible combinations, which can directly be used in language model and scorer creation. The scorer would go into server's voice directory
- A .json file, which is a resource file for the client. It contains a json formatted information of the language, localized chess piece / row / column names, along with sentence list and related intents. This file has to be moved into client's locales/locale directory.

If you change the generator, you need to follow the same path to update the scorer and the resource files, which are final products of the process.

The "intents" are hardcoded program parts in the client. For example:

- User speaks sentence: "Take back"
- Calculated intent on client: "command.undo"
- Client action: chess.undo()

So, sentences-intents-client code work in tandem, each intent needs at least one sentence, or if one needs a new intent, it should be programmed into the client and reflected in all languages.

Please note that not all intents here are implemented in the client yet.

## Example English Sentences

The following style sentences are generated and understood by the voice AI. 

**Move / Capture intents**

```python
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
```

**Other implemented intents**

```python
# KINGSIDE/QUEENSIDE CASTLING INTENTS
iCastlingKingside = ["kingside castling"]
iCastlingQueenside = ["queenside castling"]

# IGNORED INTENTS
iIgnored = ["check", "checkmate", "stalemate"]

# GAME COMMAND INTENTS
iCommandUndo = ["undo", "undo move", "take back"]
iCommandReset = ["reset game"]
```

**Intents not implemented yet**

```python
# Promotions
iPromotion = ["promote to {piece}"]

# RESIGN INTENTS
iResign = ["i resign", "black resigns", "white resigns"]

# OFFER/ACCEPT DRAW INTENTS
iDrawOffer = ["i offer draw"]
iDrawAccept = ["i accept draw"]

# GAME COMMAND INTENTS
iCommandPlayBlack = ["play black"]
iCommandPlayWhite = ["play white"]
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

# with numbers
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
```
