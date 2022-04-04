"use strict";
const config = require("./config.js");
const http = require("http");
const https = require("https");
const fs = require("fs");
const SOCKET_IO = require("socket.io");
const STT = require("stt");
const VAD = require("node-vad");
//const { v4: uuidv4 } = require("uuid");

// Debug Console Output Flags
const DEBUG_LEVEL = {
  NONE: 0,
  ERROR: 1,
  WARNING: 2,
  INFO: 3,
  DEBUG: 4,
};
const debugSRV = DEBUG_LEVEL.INFO;
const debugSIO = DEBUG_LEVEL.INFO;
const debugSTT = DEBUG_LEVEL.INFO;

// Server Constants
const SERVER_HOST = config.HOST;
const SERVER_PORT = process.env.PORT || config.PORT;
const MAX_CLIENTS = 1;

// STT Constants
const STT_DATA_DIR = __dirname + "/voice/"; // path to stt english model directory
const STT_MODEL_EXT = ".tflite";
const STT_SCORER_EXT = ".scorer";
//const LANGUAGES = ["de", "en", "fr", "hi", "ru", "tr"];
const LANGUAGES = ["de", "en", "tr"];
const HOTWORDS = [
  [
    // de
  ],
  [
    // en
  ],
  [
    // tr
  ],
];
const DEFAULT_LANG_CODE = "en";

const SILENCE_THRESHOLD = 1000; // how many milliseconds of inactivity before processing the audio
// const VAD_MODE = VAD.Mode.NORMAL;
// const VAD_MODE = VAD.Mode.LOW_BITRATE;
// const VAD_MODE = VAD.Mode.AGGRESSIVE;
const VAD_MODE = VAD.Mode.VERY_AGGRESSIVE;

// STT Globals Variables
let LANG_CODE;
const vad = new VAD(VAD_MODE);

// Get argument for default
const args = process.argv.slice(2);
if (args.length > 0 && LANGUAGES.includes(args[0])) {
  LANG_CODE = args[0];
} else {
  LANG_CODE = DEFAULT_LANG_CODE;
}

debugSRV >= DEBUG_LEVEL.INFO &&
  console.log("----------------- START VOICE CHESS SERVER -------------------");
console.log(`NODE_ENV=${config.NODE_ENV}`);
console.log(`HTTPS=${config.HTTPS}`);
debugSRV >= DEBUG_LEVEL.INFO && console.log("Supported Languages:", LANGUAGES);

//----------------------------------------------
// Class UserConnection
//----------------------------------------------

// class UserSession {
//   sessionId = undefined; //
//   sttEngine = undefined; // STTInferenceEngine

//   constructor() {
//     this.sessionId = uuidv4();
//   }
// }

//----------------------------------------------
// Class STTInferenceEngine
//----------------------------------------------

class STTInferenceEngine {
  model = undefined;
  modelPath = undefined;
  scorerPath = undefined;
  modelStream = undefined;
  recordedChunks = 0;
  recordedAudioLength = 0;
  silenceStart = null;
  endTimeout = null;
  silenceBuffers = [];

  constructor(langCode) {
    this.modelPath = STT_DATA_DIR + langCode + STT_MODEL_EXT;
    this.scorerPath = STT_DATA_DIR + langCode + STT_SCORER_EXT;
    this.model = new STT.Model(this.modelPath);
    this.model.enableExternalScorer(this.scorerPath);
    const inx = LANGUAGES.findIndex((l) => l === langCode);
    if (inx > -1 && HOTWORDS[inx].length > 0) {
      debugSTT >= DEBUG_LEVEL.INFO && console.log("HOTWORDS=", HOTWORDS[inx]);
      HOTWORDS[inx].forEach((hw) => {
        this.model.addHotWord(hw, 10.0);
      });
    }
  }

  // ----- STREAM FUNCTIONS -----------

  endAudioStream(callback) {
    debugSTT >= DEBUG_LEVEL.INFO && process.stdout.write("[end]");
    const results = this.intermediateDecode();
    if (results) {
      if (callback) {
        callback(results);
      }
    }
  }

  resetAudioStream() {
    clearTimeout(this.endTimeout);
    debugSTT >= DEBUG_LEVEL.INFO && process.stdout.write("[reset]");
    this.intermediateDecode(); // ignore results
    this.recordedChunks = 0;
    this.silenceStart = null;
  }

  processSilence(data, callback) {
    if (this.recordedChunks > 0) {
      // recording is on
      debugSTT >= DEBUG_LEVEL.DEBUG && process.stdout.write("-"); // silence detected while recording

      this.feedAudioContent(data);

      if (this.silenceStart === null) {
        this.silenceStart = new Date().getTime();
      } else {
        let now = new Date().getTime();
        if (now - this.silenceStart > SILENCE_THRESHOLD) {
          this.silenceStart = null;
          debugSTT >= DEBUG_LEVEL.INFO && process.stdout.write("[end]");
          let results = this.intermediateDecode();
          if (results) {
            if (callback) {
              callback(results);
            }
          }
        }
      }
    } else {
      debugSTT >= DEBUG_LEVEL.DEBUG && process.stdout.write("."); // silence detected while not recording
      this.bufferSilence(data);
    }
  }

  bufferSilence(data) {
    // VAD has a tendency to cut the first bit of audio data from the start of a recording
    // so keep a buffer of that first bit of audio and in addBufferedSilence() reattach it to the beginning of the recording
    this.silenceBuffers.push(data);
    if (this.silenceBuffers.length >= 3) {
      this.silenceBuffers.shift();
    }
  }

  addBufferedSilence(data) {
    let audioBuffer;
    if (this.silenceBuffers.length) {
      this.silenceBuffers.push(data);
      let length = 0;
      this.silenceBuffers.forEach(function (buf) {
        length += buf.length;
      });
      audioBuffer = Buffer.concat(this.silenceBuffers, length);
      this.silenceBuffers = [];
    } else audioBuffer = data;
    return audioBuffer;
  }

  processVoice(data) {
    this.silenceStart = null;
    if (this.recordedChunks === 0) {
      debugSTT >= DEBUG_LEVEL.INFO && process.stdout.write("");
      debugSTT >= DEBUG_LEVEL.INFO && process.stdout.write("[start]"); // recording started
    } else {
      debugSTT >= DEBUG_LEVEL.DEBUG && process.stdout.write("="); // still recording
    }
    this.recordedChunks++;

    data = this.addBufferedSilence(data);
    this.feedAudioContent(data);
  }

  createStream() {
    this.modelStream = this.model.createStream();
    this.recordedChunks = 0;
    this.recordedAudioLength = 0;
  }

  finishStream() {
    if (this.modelStream) {
      let start = new Date();
      let text = this.modelStream.finishStream();
      if (text) {
        debugSTT >= DEBUG_LEVEL.INFO && process.stdout.write("");
        debugSTT >= DEBUG_LEVEL.INFO &&
          console.log("STT: Recognized Text:", text);
        let recogTime = new Date().getTime() - start.getTime();
        return {
          text,
          recogTime,
          audioLength: Math.round(this.recordedAudioLength),
        };
      }
    }
    this.silenceBuffers = [];
    this.modelStream = null;
  }

  intermediateDecode() {
    let results = this.finishStream();
    this.createStream();
    return results;
  }

  feedAudioContent(chunk) {
    this.recordedAudioLength += (chunk.length / 2) * (1 / 16000) * 1000;
    this.modelStream.feedAudioContent(chunk);
  }

  processAudioStream(data, callback) {
    vad.processAudio(data, 16000).then((res) => {
      switch (res) {
        case VAD.Event.ERROR:
          debugSTT >= DEBUG_LEVEL.WARNING && console.log("VAD ERROR");
          break;
        case VAD.Event.NOISE:
          debugSTT >= DEBUG_LEVEL.WARNING && console.log("VAD NOISE");
          break;
        case VAD.Event.SILENCE:
          this.processSilence(data, callback);
          break;
        case VAD.Event.VOICE:
          this.processVoice(data);
          break;
        default:
          debugSTT >= DEBUG_LEVEL.WARNING && console.log("default", res);
      }
    });

    // timeout after 1s of inactivity
    clearTimeout(this.endTimeout);
    this.endTimeout = setTimeout(function () {
      debugSTT >= DEBUG_LEVEL.WARNING && console.log("STT: timeout");
      // this.resetAudioStream(); // TO-FIX not a function
    }, 1000);
  } // processAudioStream
} // class


//
// ----- MAIN -----------
//

let sstEngine;

// Create Inference Engine Array

// Create HTTP or HTTPS Server
let webServer;
if (config.HTTPS === true) {
  const options = {
    // key: fs.readFileSync('./.cert/server.key'),
    // cert: fs.readFileSync('./.cert/server.crt'),
    key: fs.readFileSync(config.SSL_KEY_FILE),
    cert: fs.readFileSync(config.SSL_CRT_FILE),
    requestCert: false,
    rejectUnauthorized: false,
  };
  
  webServer = https.createServer(options, (req, res) => {
    res.writeHead(200);
    res.write("voice-chess-server");
    res.end();
  });
} else { // use plain HTTP
  webServer = http.createServer((req, res) => {
    res.writeHead(200);
    res.write("voice-chess-server");
    res.end();
  });
}


// Initialize io with Cors
const ioServer = new SOCKET_IO.Server(webServer, {
  // transports: ["polling", "websocket"],
  // allowUpgrades: true,
  transports: ["websocket"],
  allowUpgrades: false,
  cors: {
    origin: "*:*",
  },
});

// const io = socketIO(app, {});
// io.set("origins", "*:*");
// io.use("origins");

ioServer.on("connection", (socket) => {
  debugSIO >= DEBUG_LEVEL.INFO &&
    console.log("SIO: client connected. S.id:", socket.id);

  // check server load and send accept/reject
  if (ioServer.engine.clientsCount > MAX_CLIENTS) {
    console.log("SIO-REJECT: Server full!");
    socket.emit("full");
    // socket.disconnect(); // disconnection done in client
  } else {
    socket.emit("accept");
  }

  // Receive language code, check available, set it or use default, respond
  socket.on("lang-code", (data) => {
    debugSIO >= DEBUG_LEVEL.INFO && console.log("SIO: Requested lang:", data);
    if (LANGUAGES.indexOf(data) > -1) {
      LANG_CODE = data;
    } else {
      LANG_CODE = DEFAULT_LANG_CODE;
    }
    // set language and send back
    debugSIO >= DEBUG_LEVEL.INFO && console.log("SIO: sttlang:", LANG_CODE);
    socket.emit("sttlang", LANG_CODE);
    sstEngine = new STTInferenceEngine(LANG_CODE);
    sstEngine.createStream();
  });

  // client disconnect
  socket.once("disconnect", () => {
    debugSIO >= DEBUG_LEVEL.INFO &&
      console.log("SIO: client disconnected. S.id:", socket.id);
    sstEngine = null; // ???
  });

  // client disconnecting
  socket.on("disconnecting", (reason) => {
    debugSIO >= DEBUG_LEVEL.INFO &&
      console.log("SIO: User has left:", socket.id, "reason:", reason);
  });

  // start receive audio stream
  socket.on("stream-data", (data) => {
    sstEngine.processAudioStream(data, (results) => {
      socket.emit("recognize", results);
    });
  });

  // end receive audio stream
  socket.on("stream-end", () => {
    sstEngine.endAudioStream((results) => {
      socket.emit("recognize", results);
    });
  });

  // stream reset
  socket.on("stream-reset", () => {
    sstEngine.resetAudioStream();
  });

  // connection error
  // socket.engine.on("connection_error", (err) => {
  //   console.log(
  //     "SIO-ERROR: req=",
  //     err.req,
  //     "code=",
  //     err.code,
  //     "msg=",
  //     err.message,
  //     "context=",
  //     err.context,
  //   );
  // });
});

webServer.listen(SERVER_PORT, SERVER_HOST, () => {
  debugSRV >= DEBUG_LEVEL.INFO &&
    console.log(
      "SIO: Socket server",
      SERVER_HOST,
      "listening on:",
      SERVER_PORT,
    );
  debugSRV >= DEBUG_LEVEL.INFO &&
    console.log(
      "--------------------------------------------------------------",
    );
});

module.exports = webServer;
