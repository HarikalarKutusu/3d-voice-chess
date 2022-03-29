# 3D Voice Chess Client (Web / React)

This client implementation uses react, three.js, react-three-fiber (and drei). It uses chess.js to keep the chess data and do some of the validations.

## Usage / Algorithm

The main usage/algorithm is as follows (also explaining the UI flow):

- Draw the 3D layout & UI panel. If you mouse-click on a chess piece, it will show all possible moves. If you hover over a cell it highlights. There is currently no manual play or animation.
- User selects language (both UI and STT languages)
- Network button: Tries to connect to the server (it might be down or full - currently one connection allowed). Client sends a language request to the server and server responds back. These are shown as client and server language codes. Of course they must be same for successful inference.
- Microphone button: Enabled after successful server connection. When pressed, it tries to find/connect your microphone and asks for permission. If everything is OK, it starts to stream to the server.
- Playing: Currently, the user plays both sides and current player color is shown a a pawn in that color.
  - Player speaks the chess move
  - The audio is sent to the server where the server makes the inference and sends back a text transcription.
  - The recognized wording is displayed on the panel.
  - Client analyzes the text and validates the move. It is mainly a hard coded NLP intend mechanism, where pieces, from and to coordinates are either taken from the sentence or missing parts get calculated using chess.js. Any impossible movements etc are shown on the panel as errors.
  - The suggested move is shown on the panel as "piece from => to"
  - Client tries to make the actual move using chess.js, if it is OK, the move is shown on the panel in chess notation or an error message is shown.
  - Special cases (check, check-mate, draw) are shown on the panel.
- Help icon is not implemented yet (it will show accepted voice command formats in the selected language along with some usage).

## Voice Commands

We try to implement natural commands from a chess player, not only "move x from y to z" style very strict format. These are defined in Language Model preparation. Please check the [Chess Sentence Generator]<https://github.com/HarikalarKutusu/3d-voice-chess/tree/main/language-model-creation/chess-sentence-generators> section's readme file for English. For others, have a peek at the Python files.

## Missing parts and To-Do's

- The chess language part must be transformed into resource files, currently they are hard coded.
- Help button must be implemented to show the usage and possible commands.
- UI (tooltip text, error strings etc) must be translated (there is no l10n/i18n yet)

### Longer Term To-Do

- A 2D board implementation in 3D
- Piece animations
- Manual play
- Play against a chess AI engine
- Multi-player (e.g. socket.io rooms for two players and N spectators - requires  server-side changes of course)
- Integrate Coqui TTS (Text to Speech) where possible
