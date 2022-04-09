//
// AUDIO HANDLING & SOCKET.IO TO SERVER (COMPONENT)
//

/*
Exported methods: startRecording, stopRecording

Provided JSX:
- Language selection
- server/nw: Connect & show connection status
- mic: Connect to media service and show recording status
- local language
- communication animation
- server STT language
- last STT recognition
- Warning/error area
*/

// Imports
import { useState, useEffect, useRef } from "react";
import intl from "react-intl-universal";
import { io, Socket } from "socket.io-client";
// Store
import { useStore } from "../stores/vcstore";
// Icons
import { FaNetworkWired as NetWorkIcon } from "@react-icons/all-files/fa/FaNetworkWired";
import { FaMicrophone as MicrophoneIcon } from "@react-icons/all-files/fa/FaMicrophone";
// import { CgLaptop as LaptopIcon } from "@react-icons/all-files/cg/CgLaptop";
// import { CgServer as ServerIcon } from "@react-icons/all-files/cg/CgServer";
import { BiTransfer as TransferIcon } from "@react-icons/all-files/bi/BiTransfer";
import { BiHelpCircle as HelpIcon } from "@react-icons/all-files/bi/BiHelpCircle";

// import {
//   SERVER_PORT_DEFAULT,
//   SERVER_URL_DEFAULT,
// } from "../helpers/voiceHelper";
import {
  intlInit,
  LanguageCodesType,
  VOICE_LANGUAGES,
} from "../helpers/localeHelper";

import { STTValidator } from "./sttValidator";
import "./socketVoice.css";

// DEBUG
//const debugSocketVoice = false;

// Worker
const DOWNSAMPLING_WORKER = "./downsampling_worker.js";

interface ISTTResult {
  id: number;
  text: string;
}

export type ISocketVoiceProps = {
  serverURL?: string; // default: http://localhost
  serverPort?: string | number; // default: 4000
};

const SocketVoice = (props: ISocketVoiceProps) => {
  // props defaults
  // const { serverURL = SERVER_URL_DEFAULT, serverPort = SERVER_PORT_DEFAULT } = props;

  // store
  const { langCode, setLangCode } = useStore();
  const { lastRecognition, setLastRecognition } = useStore();
  const { lastError, setLastError, setTimedError } = useStore();

  // state - Server
  const [connectedServer, setConnectedServer] = useState<string>("");

  // state - SocketAudio Module
  const [connectedStatus, setConnectedStatus] = useState<boolean>(false);
  const [serverLangCode, setServerLangCode] = useState<string>("??");
  const [recordingStatus, setRecordingStatus] = useState<boolean>(false);

  // Create & save socket - no AutoConnect
  const [socket, setSocket] = useState<Socket>();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLangCode = e.target.value as LanguageCodesType;
    // debugSocketVoice && console.log("LANG Changed to:", newLangCode);
    setLangCode(newLangCode);
    intlInit(newLangCode);
  };

  const LanguageSelector = (props: any) => {
    const enabledLanguages = VOICE_LANGUAGES.filter((l) => l.enabled === 1);

    return (
      <select
        title={intl.get("ui.languageselector.title")}
        id="langSelector"
        className="language-selector"
        value={langCode}
        disabled={connectedStatus || recordingStatus}
        onChange={(e) => handleLanguageChange(e)}
      >
        {enabledLanguages.map((lang) => {
          return (
            <option
              key={lang.code}
              value={lang.code}
              className="language-option"
            >
              {lang.code}-{lang.nativeName}
            </option>
          );
        })}
      </select>
    );
  };

  //--------------------------------------------------------------
  // ClientAudio Component
  //--------------------------------------------------------------
  const ClientAudio = (props: any) => {
    // ref
    const isMounted = useRef(true);

    // state - Media/Audio
    const [audioContext, setAudioContext] = useState<AudioContext | undefined>(
      undefined,
    );
    const [mediaStream, setMediaStream] = useState<MediaStream | undefined>(
      undefined,
    );
    const [mediaStreamSource, setMediaStreamSource] = useState<
      MediaStreamAudioSourceNode | undefined
    >(undefined);
    const [processor, setProcessor] = useState<ScriptProcessorNode | undefined>(
      undefined,
    );

    // localVars
    let aContext: AudioContext;
    //let mStream: MediaStream;
    let mStreamSource: MediaStreamAudioSourceNode;
    let proc: ScriptProcessorNode;

    //
    // Function: createAudioProcessor
    //
    const createAudioProcessor = (
      aContext: AudioContext,
      aSource: MediaStreamAudioSourceNode,
    ) => {
      // debugSocketVoice && console.log("WA: Creating Audio Processor");
      if (aContext === undefined) console.log("audioContext NOT AVAILABLE");
      let lProcessor = aContext.createScriptProcessor(4096, 1, 1);
      if (!lProcessor) console.log("processor NOT AVAILABLE");
      if (lProcessor && socket) {
        // debugSocketVoice && console.log("WA: Created Processor");
        const sampleRate = mStreamSource.context.sampleRate;
        const downsampler = new Worker(DOWNSAMPLING_WORKER);
        downsampler.postMessage({
          command: "init",
          inputSampleRate: sampleRate,
        });
        downsampler.onmessage = (e) => {
          if (socket.connected) {
            socket.emit("stream-data", e.data.buffer);
          }
        };
        lProcessor.onaudioprocess = (event: AudioProcessingEvent) => {
          var data = event.inputBuffer.getChannelData(0);
          downsampler.postMessage({ command: "process", inputFrame: data });
        };
        lProcessor.connect(aContext.destination);
      }
      return lProcessor;
    };
    //
    // Function: startMicrophone
    //
    const startMicrophone = () => {
      // debugSocketVoice && console.log("WA: Starting Microphone");
      aContext = new AudioContext();
      setAudioContext(aContext);

      // SUCCESS function: User Media Obtained
      const success = (stream: MediaStream) => {
        // debugSocketVoice && console.log("WA: Starting Recording");
        // mStream = stream;
        setMediaStream(stream);
        mStreamSource = aContext.createMediaStreamSource(stream);
        setMediaStreamSource(mStreamSource);
        proc = createAudioProcessor(aContext, mStreamSource);
        setProcessor(proc);
        mStreamSource.connect(proc);
      };

      // FAIL function: User Media could not be obtained
      const fail = (e: MediaStreamError) => {
        // debugSocketVoice && console.error("WA: Recording failure-", e);
        setTimedError(
          intl.get("err.recordingfailure", { msg: e.message }),
          3000,
        );
      };

      // TRY TO ACCESS USER MEDIA
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // debugSocketVoice && console.log("WA: TRYING SECURE");
        navigator.mediaDevices
          .getUserMedia({
            video: false,
            audio: true,
          })
          .then(success)
          .catch(fail);
      } else if (navigator.getUserMedia) {
        // This will not work with modern browsers
        // debugSocketVoice && console.log("WA: TRYING: navigator.getUserMedia");
        navigator.getUserMedia(
          {
            video: false,
            audio: true,
          },
          success,
          fail,
        );
      } else {
        // debugSocketVoice && console.log("WA: NO MIC AVAILABLE");
      }
      //return null;
    };

    //
    // Function: startRecording
    //
    const startRecording = () => {
      // debugSocketVoice && console.log("WA: Prep for recording");
      setRecordingStatus(true);
      startMicrophone();
    };

    //
    // Function: stopMicrophone
    //
    const stopMicrophone = () => {
      // debugSocketVoice && console.log("WA: stopMicrophone");
      if (mediaStream) {
        mediaStream.getTracks()[0].stop();
      }
      if (mediaStreamSource) {
        mediaStreamSource.disconnect();
      }
      if (processor) {
        //processor.shutdown();
      }
      if (audioContext) {
        audioContext.close();
      }
    };

    //
    // Function: stopRecording
    //
    const stopRecording = () => {
      // debugSocketVoice && console.log("WA: stopRecording");
      if (recordingStatus) {
        if (socket?.connected) {
          socket.emit("stream-reset");
        }
        //clearInterval(recordingInterval as NodeJS.Timeout); // TO-TEST
        setRecordingStatus(false);
        stopMicrophone();
      }
    };

    useEffect(() => {
      // debugSocketVoice && console.log("ClientAudio - USEEFFECT");
    }, []);

    // cleanup
    useEffect(() => {
      return () => {
        //stopRecording();
        // debugSocketVoice && console.log("ClientAudio - Unmount Cleanup");
        setAudioContext(undefined);
        setMediaStream(undefined);
        setMediaStreamSource(undefined);
        setProcessor(undefined);
        isMounted.current = false;
      };
    }, []);

    //
    // Click Handler
    //
    const handleMicrophoneClick = () => {
      // debugSocketVoice && console.log("MIC-Click");
      if (isMounted && connectedStatus && !recordingStatus) {
        startRecording();
      } else if (isMounted && connectedStatus && recordingStatus) {
        stopRecording();
      }
    };

    return (
      <MicrophoneIcon
        title={
          recordingStatus
            ? intl.get("ui.clientaudio.title.recording")
            : intl.get("ui.clientaudio.title.notrecording")
        }
        className={connectedStatus ? "svIconButton" : "svIconButtonDisabled"}
        /* size={iconSize} */
        color={recordingStatus ? iconActiveColor : iconButtonPassiveColor}
        onClick={handleMicrophoneClick}
      />
    );
  }; // client audio

  //--------------------------------------------------------------
  // ServerConnection Component
  //--------------------------------------------------------------
  const ServerConnection = (props: any) => {
    // ref
    const isMounted = useRef(true);

    const RECON_TRIALS = 3;
    const RECON_DELAY = 1000;
    const RECON_MAX = 3000;
    const TIMEOUT = 5000;
    const MAX_SCANS = 1;

    let unSuccessfulCount = -1; // will increment first

    // Server Pool
    const serverNames = process.env.REACT_APP_SERVER_NAMES!.split(",") || [
      "localhost",
    ];
    const serverPool = process.env.REACT_APP_SERVER_POOL!.split(",") || [
      "localhost",
    ];
    let serverPoolInx = -1; // will increment first - TODO - make random
    //let serverPoolInx = Math.floor(serverPool.length * Math.random()) - 1;

    //
    // Function: serverConnect
    //
    const serverConnect = (server: string) => {
      // debugSocketVoice && console.log("SIO-serverConnect", serverURL + ":" + serverPort);
      console.log("Trying Server:", server);
      const socket = io(server, {
        autoConnect: true,
        // forceNew: true,
        // multiplex: true,
        transports: ["websocket"],
        timestampRequests: true,
        reconnection: true,
        reconnectionAttempts: RECON_TRIALS,
        reconnectionDelay: RECON_DELAY,
        reconnectionDelayMax: RECON_MAX,
        rejectUnauthorized: false,
        timeout: TIMEOUT,
        secure: true,
      });

      //
      // "reconnect_failed" after N attempts, so try next server
      //
      socket.io.on("reconnect_failed", () => {
        // debugSocketVoice && console.log("CONNECT-FAIL:", serverPool[serverPoolInx]);
        console.log("CONNECT-FAIL:", server);
        socket.close();
      });

      // set status when connected
      socket.on("connect", () => {
        // debugSocketVoice && console.log("CONNECT-SUCCESS:", serverPool[serverPoolInx]);

        // server sends "full" signal
        socket.on("full", () => {
          // debugSocketVoice && console.log("SIO: Server full!");
          socket.disconnect();
          socket.close();
          setTimedError(
            intl.get("err.serverfull", { server: serverNames[serverPoolInx] }),
            3000,
          );
          retryConnect(); // retry on another server
        });

        // server sends "accept" signal
        socket.on("accept", () => {
          // debugSocketVoice && console.log("SIO: Accept!");
          setSocket(socket);
          setConnectedStatus(true);
          setConnectedServer(serverNames[serverPoolInx]);
          setTimedError(
            intl.get("msg.connectedto", { server: serverNames[serverPoolInx] }),
            3000,
          );
          // send language request to server
          socket.emit("lang-code", langCode);
        });

        // server replies language request with "sttlang"
        socket.on("sttlang", (result) => {
          // debugSocketVoice && console.log("SIO: Server STT Lang:", result);
          setServerLangCode(result);
          if (langCode !== result) {
            setLastError(intl.get("err.differentlanguages"));
          }
        });

        // received voice recognition
        socket.on("recognize", (results: ISTTResult) => {
          // debugSocketVoice && console.log("SIO-STT: Recognized:", results);
          // setRecognitionCount(recognitionCount+1)
          // results.id = recognitionCount;
          // post process
          setLastRecognition(results.text);
          //this.STTPostProcess(results.text);
        });
      });

      // received disconnected from server
      socket.on("disconnect", () => {
        // debugSocketVoice && console.log("SIO: Socket disconnected");
        setConnectedServer("");
        setConnectedStatus(false);
        setRecordingStatus(false);
      });

      // Connect error
      socket.on("connect_error", (err) => {
        // debugSocketVoice && console.log("SIO: " + Date.now() + ` connect_error: ${err}`);
        setTimedError(intl.get("err.connecterror", { msg: err.message }), 2000);
        retryConnect(); // retry on another server
      });
      // }
    };

    //
    // Function: serverDisconnect
    //
    const serverDisconnect = () => {
      // debugSocketVoice && console.log("SIO: disconnect");
      socket?.disconnect();
      setConnectedStatus(false);
      setRecordingStatus(false);
      setTimedError(intl.get("msg.disconnected"), 3000);
    };

    //
    // Try connection
    //
    const retryConnect = () => {
      // console.log("retryConnect", unSuccessfulCount + 1);
      // put a maximum retrial limit
      if (unSuccessfulCount < MAX_SCANS * serverPool.length) {
        // should not be already connected
        if (connectedStatus !== true) {
          unSuccessfulCount++; // increase fail count
          serverPoolInx = Math.min(serverPoolInx + 1, serverPool.length - 1);
          // not connected yet, right?
          setTimedError(
            intl.get("msg.tryconnectto", {
              server: serverNames[serverPoolInx],
            }),
            3000,
          );
          serverConnect(serverPool[serverPoolInx]); // Try it with new server
          // prep for next if not already connected
        } else {
          // nope, already connected, nothing to do here
        }
      } else {
        // end of all trials reached
        // debugSocketVoice && console.log("CONNECT-FAILED-FOR-ALL-SERVERS");
        setTimedError(intl.get("err.allserversfull"), 5000);
      }
    };

    //
    // Click Handler
    //
    const handleNetworkClick = () => {
      // debugSocketVoice && console.log("NW-Click");
      //console.log(process.env.REACT_APP_SERVER_POOL);

      if (connectedStatus !== true) {
        unSuccessfulCount = -1; // reset count
        serverPoolInx = 0;
        serverConnect(serverPool[serverPoolInx]);
        //tryConnect();
      } else {
        serverDisconnect();
      }
    };

    useEffect(() => {
      // debugSocketVoice && console.log("ServerConnection - USEEFFECT");
    }, []);

    // cleanup
    useEffect(() => {
      return () => {
        //stopRecording();
        // debugSocketVoice && console.log("ServerConnection - Unmount Cleanup");
        isMounted.current = false;
      };
    }, []);

    return (
      <NetWorkIcon
        title={
          connectedStatus
            ? intl.get("ui.serverconnection.title.connected", {
                server: connectedServer,
              })
            : intl.get("ui.serverconnection.title.connect")
        }
        className="svIconButton"
        /* size={iconSize} */
        color={connectedStatus ? iconActiveColor : iconButtonPassiveColor}
        onClick={handleNetworkClick}
      />
    );
  }; // server connection

  useEffect(() => {
    // if not initialized yet, do init the lang record to default.
    // if (!langRecord || langRecord.intent.length === 0) {
    //   initLanguage();
    // }
  });

  //--------------------------------------------------------------
  // Click handlers
  //--------------------------------------------------------------

  const handleHelpClick = () => {
    // debugSocketVoice && console.log("HELP-Click");
  };

  //--------------------------------------------------------------
  // RENDER <- Returns a small toolbar showing controls & status
  //--------------------------------------------------------------

  const iconSize = 24;
  const iconPassiveColor = "#eee";
  const iconActiveColor = "#3cc";
  const iconButtonPassiveColor = "#333";

  return (
    <div className="svPanel">
      <LanguageSelector />
      <ServerConnection />
      <ClientAudio />
      <span
        title={intl.get("ui.clientlanguage")}
        className={connectedStatus ? "svText" : "svTextDisabled"}
      >
        {langCode}
      </span>
      {/* <LaptopIcon
        className="svIcon"
        size={iconSize}
        color={
          connectedStatus && recordingStatus
            ? iconActiveColor
            : iconPassiveColor
        }
      /> */}
      <TransferIcon
        className="svIcon"
        size={iconSize}
        color={
          connectedStatus && recordingStatus
            ? iconActiveColor
            : iconPassiveColor
        }
      />
      {/* <ServerIcon
        className="svIcon"
        size={iconSize}
        color={connectedStatus ? iconActiveColor : iconPassiveColor}
      /> */}
      <span
        title={intl.get("ui.serverlanguage")}
        className={connectedStatus ? "svText" : "svTextDisabled"}
        color={langCode !== serverLangCode ? "#c33" : ""}
      >
        {serverLangCode}
      </span>
      <STTValidator
        // langRecord={langRecord}
        sttTxt={lastRecognition}
        errTxt={lastError}
      />
      <HelpIcon
        title={intl.get("ui.help.title")}
        className="svIconButton"
        style={{ float: "right" }}
        size={iconSize}
        color={iconButtonPassiveColor}
        onClick={handleHelpClick}
      />
    </div>
  );
};

export { SocketVoice };
