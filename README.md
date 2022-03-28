# voice-chess

A voice driven 3D chess game for learning and teaching Voice AI.


## Acoustic and Language Models

Detailed information can be found here. TODO - Link.

## Open source projects used

- 3D UI: three.js & react-three-fiber (with drei)
- VOICE: Coqui STT, Coqui examples, KenLM, Mozilla Common Voice datasets
- CHESS: chess.js for chess data and controls (no AI or GUI)

The client and server voice related code is adapted from the following Coqui example:
<https://github.com/coqui-ai/STT-examples/tree/r1.0/web_microphone_websocket>

## Historical information

THe project is created during coqui.ai's "Hack the Planet" hackathon in Mozilla Festival 2022 between 8-15 March.

The main idea was to implement a speech enabled application in one week. A group of people voted for implementation of a voice controlled game (tic-tac-toe), but the idea became a multi-lingual voice driven 3D chess.

A team was formed and implementing a chess application became the goal. Team members were BÖ, JF, KM, MK.

This was a two part application aat the start:

- The server part is a node.js application which does the actual STT
- The client is a React.js app which records sentences and communicates to the server for transcription via socket.io, validate it, show on the browser with three.js and with the help of chess.js.

Due to the limited timeframe and individual time constraints, the group kept the expectations also limited.

- The UI part is kept minimal, but working. E.g. there is no manual play, enhanced UI features etc.
- A sample of languages got selected, but it can be expanded with other languages.
- There are many commanding formats for chess. To simplify things, user is forced to use a single format:

```txt
"Move <piece> from <fromCell> to <targetCell>".
```

Here "piece" is the chess piece name, such as King, Bishop etc, "cell" is the board coordinate col-row (columns: A-Z, rows: 1-8).

- After several trials with English and Turkish, we found out recognition of the single characters are now robust enough, so we used NATO alphabet: Alpha, Bravo, ... Hotel. Except the NATO naming, other wording got translated into respective languages.
- Include support for following languages: - German, English, French, Hindi, Russian, Turkish

At the end of the project duration, a semi-working software has been presented for English and Turkish.

TODO - Add links to project presentation videos.
