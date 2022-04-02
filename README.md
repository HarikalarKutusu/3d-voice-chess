# 3D Voice Chess

A multi-lingual voice driven 3D chess game for learning and teaching Voice AI using Coqui STT using limited vocabulary language models.

Please note: This repo is not production ready. It is somewhere between alpha and beta versions as of April 1st 2022.

Current capabilities:

- Single user server for Speech To Text STT inference (nodejs) (i.e. it works on a single core free node)
- 3D Frontend (voice only multi-lingual interface with some buttons & output areas)
- Currently Supported Languages: de (German), en (English), tr (Turkish)
- You play against yourself :)

![image](https://user-images.githubusercontent.com/8849617/160528210-26fd85c0-5d49-478f-bb5b-05466171590a.png)

## Content Summary

- [acoustic-model-creation](https://github.com/HarikalarKutusu/3d-voice-chess/tree/main/acoustic-model-creation): Example notebook model (TODO)
- [language-model-creation](https://github.com/HarikalarKutusu/3d-voice-chess/tree/main/language-model-creation): All files for creating your domain specific language model
- [voice-chess-react](https://github.com/HarikalarKutusu/3d-voice-chess/tree/main/voice-chess-react): Frontend - React & three.js implementation
- [voice-chess-server](https://github.com/HarikalarKutusu/3d-voice-chess/tree/main/voice-chess-server): Server - Simple single connection nodejs implementation

## How to Install

TODO

## How to Contribute

- Creation of new acoustic and language models in your language
- Better chess related wording for existing languages if needed
- Translate resource files (messages.json)
- Testing; ideas, feedback in issues; commits & PR's

### How can I add my language?

1. Get information on chess terminology in your language (if you don't know already - Wikipedia and Youtube helps).
2. Examine existing sentences/programming in [chess sentence generators](https://github.com/HarikalarKutusu/3d-voice-chess/tree/main/language-model-creation/chess-sentence-generators).
3. Copy an appropriate [sentence generator](https://github.com/HarikalarKutusu/3d-voice-chess/tree/main/language-model-creation/chess-sentence-generators), rename it to your language code and translate/adapt.
4. Find a compatible [Coqui](https://coqui.ai/) [STT](https://stt.readthedocs.io/en/latest/index.html) [acoustic model](https://coqui.ai/models) (.tflite file) or [train](https://github.com/HarikalarKutusu/3d-voice-chess/tree/main/acoustic-model-creation) one from [Mozilla Common Voice datasets](https://commonvoice.mozilla.org/en/datasets).
5. Translate resource files (messages.json)
6. Test your results on your forked server/client locally and improve your models if needed.
7. Make a [Pull Request (PR)](https://github.com/HarikalarKutusu/3d-voice-chess/pulls) to add your acoustic model (.tflite), language model (.scorer) to voice-chess-server/voice dir, add generated json language file and translated messages.json files to voice-chess-react/locale.

If you cannot do some of these, please [open an issue](https://github.com/HarikalarKutusu/3d-voice-chess/issues) so we can help.

## Other Information

### Current Acoustic and Language Models

Detailed information can be found [here](https://github.com/HarikalarKutusu/3d-voice-chess/tree/main/voice-chess-server/voice).

### Open source projects used

- VOICE: [Coqui STT](https://github.com/coqui-ai/STT), [Coqui example](https://github.com/coqui-ai/STT-examples/tree/r1.0/web_microphone_websocket), [KenLM](https://github.com/kpu/kenlm), [Mozilla Common Voice datasets](https://commonvoice.mozilla.org/en/datasets).
- 3D UI: [three.js](https://threejs.org/) & [react-three-fiber](https://github.com/pmndrs/react-three-fiber) (with [drei](https://github.com/pmndrs/drei) and [zustand](https://github.com/pmndrs/zustand))
- CHESS: [chess.js](https://github.com/jhlywa/chess.js) for chess data and controls (no AI or GUI).

The client and server voice related code is adapted from the Coqui example [web_microphone_websocket](https://github.com/coqui-ai/STT-examples/tree/r1.0/web_microphone_websocket).

### Historical information

The first version of the project is created during [coqui.ai](https://coqui.ai/)'s "[Hack the Planet](https://schedule.mozillafestival.org/session/JVHV3M-1)" hackathon in [Mozilla Festival](https://www.mozillafestival.org/) 2022, between 8-15 March.

The main idea was to implement a speech enabled application in one week. A group of people voted for implementation of a voice controlled game (tic-tac-toe), but the idea became a multi-lingual voice driven 3D chess. A team was formed and implementing a chess application became the goal. Team members were BÖ, JF, KM, MK.

This was a two part application at the beginning:

- The server part is a node.js application which does the actual STT
- The client is a React.js app which records sentences and communicates to the server for transcription via socket.io, validate it, show on the browser with three.js and with the help of chess.js.

Due to the limited timeframe and individual time constraints, the group kept the expectations also limited.

- The UI part is kept minimal, but working. E.g. there is no manual play, enhanced UI features etc.
- A sample of languages got selected, but it can be expanded with other languages.
- There are many commanding formats for chess. To simplify the whole workflow, user is forced to use a single format in this version:

```txt
"Move <piece> from <fromCell> to <targetCell>".
```

Here "piece" is the chess piece name, such as King, Bishop etc, "cell" is the board coordinate col-row (columns: A-Z, rows: 1-8).

- After several trials with English and Turkish, we found out recognition of single alphabetic characters are not robust enough (nearly impossible), so we used NATO alphabet: Alpha, Bravo, ... Hotel. Except the NATO naming, other wording got translated into respective languages.
- Include support for following languages: - German, English, French, Hindi, Russian, Turkish

At the end of the project duration, a semi-working software has been presented for English and Turkish.

You can watch the initial project presentation video [here](https://drive.google.com/file/d/1d_BE-IY3_0EIcv-PH2cGf9sS-8Jo7Xn4/view?usp=sharing).

And, as promised at the end of the presentation, we continue to develop and make it open-source here.
