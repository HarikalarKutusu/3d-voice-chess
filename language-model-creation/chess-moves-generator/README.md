# Chess Moves Generator

This is a simple Typescript file generating possible chess moves. It uses chess.js to extract possible moves for both black and white pieces and outputs them into an intermediate chess-moves.txt file. This file is further use by the chess-sentence-generator to create raw text for the language model, where only possible wording is included (e.g. a pawn cannot go backwards). This not only limits the size of the scorer, also can be used in further semantic models.
