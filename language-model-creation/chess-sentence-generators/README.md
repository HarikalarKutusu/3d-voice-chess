# Chess Sentence Generators

Simple python scripts for each language to generate raw sentences for the language model.

Contributors are expected to duplicate one of these files into their language code, translate it and/or expand it for chess jargon in their language.

Currently supported languages: de (German), en (English), tr (Turkish)

For similar languages you can start with English (en.py).

Turkish is another possibility for languages where "to"/"from" are represented as suffixes.

Currently, in German we neglected Articles (der, die, das) and accusative forms (den, der, dem ...) for simplification. Also, Umlauts (ä, ö, ü) and scharfes S are written in their ASCII formats (ae, oe, ue, ss) for now, as they are not directly used as texts like in common ASR systems, but translated to chess notations. But this can be changed.

While playing the game, programmers and/or users can find additional and/or better sentences and these can be added to generate better language models.

## Example English Sentences

The following style sentences are generated and understood by the voice AI:

**Moves**

```python
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
```

**Captures**

```python
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
```

**Without parameters**

```python
"i resign", "black resigns", "white resigns",
"check", "checkmate", "stalemate",
"kingside castle", "queenside castle", "kingside castling", "queenside castling"
```


**Commands to interface**

```python
"undo", "undo move", "take back",
"play black", "play white", "reset game", "finish game", "replay game"
```
