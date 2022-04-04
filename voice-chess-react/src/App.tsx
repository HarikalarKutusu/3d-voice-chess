//import "./App.scss";

// React
import { Suspense, useEffect, useState } from "react";
import intl from "react-intl-universal";

// THREE
import { Object3D } from "three";
import { DragControls } from "three/examples/jsm/controls/DragControls";
// @react-three/*
import { Canvas, extend } from "@react-three/fiber";
// drei
import {
  Stars,
  softShadows,
  OrbitControls,
  // GizmoHelper,
  // GizmoViewport,
  Loader,
  useGLTF,
} from "@react-three/drei";

// Voice Chess
import { Chess3D } from "./components/chess3D";
import { SocketVoice } from "./components/socketVoice";
import { intlInit, LanguageCodesType } from "./helpers/localeHelper";
import { useStore } from "./stores/vcstore";

extend({ DragControls });

// DEBUG
// const debugApp = false;

//====================================================================
//------------------------ APP ---------------------------------------
//====================================================================
const App = () => {
  //
  const [initDone, setInitDone] = useState(false);
  // Store
  const { setLangCode } = useStore();

  // debugApp && console.log("APP - Regen");

  // const CLIENT_HOST = process.env.HOST || "https://localhost";
  // const CLIENT_PORT = process.env.PORT || 3000;
  // const SERVER_HOST = process.env.REACT_APP_SERVER_HOST || "https://localhost";
  // const SERVER_PORT = process.env.REACT_APP_SERVER_PORT || 4000;

  useEffect(() => {
    // debugApp && console.log("APP - useEffect");

    if (!initDone) {
      // i18n
      intlInit().then(() => {
        const { currentLocale } = intl.getInitOptions();
        // debugApp && console.log("APP - LangInit=", currentLocale);
        setLangCode(currentLocale as LanguageCodesType);
      });

      // Coordinates
      Object3D.DefaultUp.set(0, 0, 1);
      // Soft shadows
      softShadows({
        frustum: 3.75, // Frustum width (default: 3.75) must be a float
        size: 0.005, // World size (default: 0.005) must be a float
        near: 9.5, // Near plane (default: 9.5) must be a float
        samples: 17, // Samples (default: 17) must be a int
        rings: 11, // Rings (default: 11) must be a int
      });

      // Pre-Load piece models
      useGLTF.preload("assets/models/Bishop.gtlf");
      useGLTF.preload("assets/models/King.gltf");
      useGLTF.preload("assets/models/Knight.gtlf");
      useGLTF.preload("assets/models/Pawn.gtlf");
      useGLTF.preload("assets/models/Queen.gtlf");
      useGLTF.preload("assets/models/Rook.gtlf");

      // set initDone
      setInitDone(true);
    }
  }, [initDone, setInitDone, setLangCode]);

  //
  return !initDone ? (
    <></>
  ) : (
    <>
      {/* <SocketVoice serverURL={SERVER_HOST} serverPort={SERVER_PORT} /> */}
      <SocketVoice />
      <Canvas camera={{ position: [2, -5, 9], fov: 60 }} dpr={[1, 2]} shadows>
        {/* World & Environment */}
        <Stars />
        {/* Controls & Gizmo */}
        <OrbitControls
          // ref={orbitRef}
          target={[4, 4, 0]}
          //makeDefault
          rotateSpeed={2}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2.1}
        />
        {/* 
        <GizmoHelper alignment="bottom-right" margin={[50, 50]}>
          <GizmoViewport />
        </GizmoHelper>
        <axesHelper />
        */}
        {/* Lights */}
        <ambientLight color="#444" intensity={1} />
        <directionalLight
          position={[5, 5, 5]}
          color="#fefef0"
          intensity={1}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          // shadow-bias={-0.0001}
        />
        <pointLight
          position={[-5, 5, 5]}
          color="#fefef0"
          intensity={1}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          // shadow-bias={-0.0001}
        />
        {/* Objects */}
        <Suspense fallback={null}>
          <Chess3D />
        </Suspense>
      </Canvas>
      <Loader />
    </>
  ); // return
}; // App

export default App;
