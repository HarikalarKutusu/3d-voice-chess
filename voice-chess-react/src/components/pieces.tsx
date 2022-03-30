import React, { useRef, useState } from "react";
// three
import {
  ColorRepresentation,
  Euler,
  Mesh,
  MeshStandardMaterial as MeshPhysicalMaterial,
} from "three";
// import { DragControls } from "three/examples/jsm/controls/DragControls";
// fiber
import { GroupProps, MeshProps, MaterialProps } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
// helpers
import {
  PIECECOLOR_BLACK,
  PIECECOLOR_HOVERED,
  PIECECOLOR_WHITE,
} from "./../helpers/chessHelper";

// DEBUG
const debugPieces = false;

// extend({ DragControls });

//
// Types from gltfjsx output running on pieces
//

type BishopGLTFResult = GLTF & {
  nodes: {
    Bishop: THREE.Mesh
  }
  materials: {
    ['Black Glass']: THREE.MeshStandardMaterial
  }
}

type KingGLTFResult = GLTF & {
  nodes: {
    Dark_King: THREE.Mesh
  }
  materials: {
    ['Black Glass']: THREE.MeshStandardMaterial
  }
}

type KnightGLTFResult = GLTF & {
  nodes: {
    Dark_Knight_2: THREE.Mesh
  }
  materials: {
    ['Black Glass']: THREE.MeshStandardMaterial
  }
}

type PawnGLTFResult = GLTF & {
  nodes: {
    Dark_Pawn_2: THREE.Mesh
  }
  materials: {
    ['Black Glass']: THREE.MeshStandardMaterial
  }
}

type QueenGLTFResult = GLTF & {
  nodes: {
    Dark_Queen: THREE.Mesh
  }
  materials: {
    ['Black Glass']: THREE.MeshStandardMaterial
  }
}

type RookGLTFResult = GLTF & {
  nodes: {
    Dark_Rock_1: THREE.Mesh
  }
  materials: {
    ['Black Glass']: THREE.MeshStandardMaterial
  }
}


//
//
//

type PieceProps = GroupProps &
  MeshProps &
  MaterialProps & { color: ColorRepresentation };

/*
const getScale = (m: Mesh) => {
  return m.children[0].scale;
};

const getBoundingBox = (g: BufferGeometry) => {
  if (g.boundingBox == null) {
    g.boundingBox = new Box3.setFromObject(g);
  }
  return g.boundingBox!;
};

const getMinY = (g: BufferGeometry) => {
  return getBoundingBox(g).min.y;
};

const getMaxY = (g: BufferGeometry) => {
  return getBoundingBox(g).max.y;
};
*/

const pieceMaterialWhite = new MeshPhysicalMaterial({
  color: PIECECOLOR_WHITE,
  roughness: 0.5,
  metalness: 0.5,
});

const pieceMaterialBlack = new MeshPhysicalMaterial({
  color: PIECECOLOR_BLACK,
  roughness: 0.5,
  metalness: 0.5,
});

const pieceMaterialHovered = new MeshPhysicalMaterial({
  color: PIECECOLOR_HOVERED,
  roughness: 0.5,
  metalness: 1.0,
});

const Bishop = (props: PieceProps) => {
  debugPieces && console.log("CREATE-Bishop")
  // state
  const [hovered, setHover] = useState(false);
  // ref
  const ref = useRef();
  const { nodes } = useGLTF("assets/models/Bishop.gltf") as unknown as BishopGLTFResult;
  const mesh = nodes.Bishop as Mesh;
  const geo = mesh.geometry;
  const mat =
    props.color === PIECECOLOR_WHITE ? pieceMaterialWhite : pieceMaterialBlack;
  return (
    <group {...props} dispose={null} ref={ref}>
      <mesh
        castShadow
        receiveShadow
        geometry={geo}
        material={hovered ? pieceMaterialHovered : mat}
        rotation={new Euler(Math.PI / 2, 0, 0)}
        position={[0, 0, 0.3]}
        scale={0.5 * 0.05192941}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
        }}
        onPointerOut={(e) => setHover(false)}
      />
      {/* <dragControls args={(group, camera, gl.domElement)} />; */}
    </group>
  );
};

const King = (props: PieceProps) => {
  debugPieces && console.log("CREATE-King")
  // state
  const [hovered, setHover] = useState(false);
  // ref
  //const group = useRef();
  const { nodes } = useGLTF("assets/models/King.gltf") as unknown as KingGLTFResult;
  const mesh = nodes.Dark_King as Mesh;
  const geo = mesh.geometry;
  const mat =
    props.color === PIECECOLOR_WHITE ? pieceMaterialWhite : pieceMaterialBlack;

  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={geo}
        material={hovered ? pieceMaterialHovered : mat}
        position={[0, 0, 0.3]}
        rotation={new Euler(Math.PI / 2, 0, 0)}
        scale={[
          0.5 * 0.12063908576965332,
          0.5 * 0.12063908576965332,
          0.5 * 0.014764209277927876,
        ]}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
        }}
        onPointerOut={(e) => setHover(false)}
      />
    </group>
  );
};

const Knight = (props: PieceProps) => {
  debugPieces && console.log("CREATE-Knight")
  // state
  const [hovered, setHover] = useState(false);
  // ref
  //const group = useRef();
  const { nodes } = useGLTF("assets/models/Knight.gltf") as unknown as KnightGLTFResult;
  const mesh = nodes.Dark_Knight_2 as Mesh;
  const geo = mesh.geometry;
  const mat =
    props.color === PIECECOLOR_WHITE ? pieceMaterialWhite : pieceMaterialBlack;
  // position={[44.41533661, 1.07157409, 35.44256592]}
  // rotation={[0, Math.PI / 2, 0]}
  // scale={[0.60162324, 0.253304, 0.60162324]}

  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={geo}
        material={hovered ? pieceMaterialHovered : mat}
        position={[0, 0, 0.01]}
        rotation={new Euler(Math.PI / 2, Math.PI / 2, 0, "XYZ")}
        // rotation={new Euler(Math.PI / 2, Math.PI / 2, 0, "XYZ")}
        scale={[0.5 * 0.60162324, 0.5 * 0.253304, 0.5 * 0.60162324]}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
        }}
        onPointerOut={(e) => setHover(false)}
      />
    </group>
  );
};

const Pawn = (props: PieceProps) => {
  debugPieces && console.log("CREATE-Pawn")
  // state
  const [hovered, setHover] = useState(false);
  // ref
  //const group = useRef();
  const { nodes } = useGLTF("assets/models/Pawn.gltf") as unknown as PawnGLTFResult;
  const mesh = nodes.Dark_Pawn_2 as Mesh;
  const geo = mesh.geometry;
  const mat =
    props.color === PIECECOLOR_WHITE ? pieceMaterialWhite : pieceMaterialBlack;

  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={geo}
        material={hovered ? pieceMaterialHovered : mat}
        position={[0, 0, 0.15]}
        rotation={new Euler(Math.PI / 2, 0, 0)}
        scale={0.5 * 0.3822428}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
        }}
        onPointerOut={(e) => setHover(false)}
      />
    </group>
  );
};

const Queen = (props: PieceProps) => {
  debugPieces && console.log("CREATE-Queen")
  // state
  const [hovered, setHover] = useState(false);
  // ref
  //const group = useRef();
  const { nodes } = useGLTF("assets/models/Queen.gltf") as unknown as QueenGLTFResult;
  const mesh = nodes.Dark_Queen as Mesh;
  const geo = mesh.geometry;
  const mat =
    props.color === PIECECOLOR_WHITE ? pieceMaterialWhite : pieceMaterialBlack;

  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={geo}
        material={hovered ? pieceMaterialHovered : mat}
        position={[0, 0, 0.3]}
        rotation={new Euler(Math.PI / 2, 0, 0)}
        scale={0.5 * 0.0108364}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
        }}
        onPointerOut={(e) => setHover(false)}
      />
    </group>
  );
};

const Rook = (props: PieceProps) => {
  debugPieces && console.log("CREATE-Rook")
  // state
  const [hovered, setHover] = useState(false);
  // ref
  //const group = useRef();
  const { nodes } = useGLTF("assets/models/Rook.gltf") as unknown as RookGLTFResult;
  const mesh = nodes.Dark_Rock_1 as Mesh;
  const geo = mesh.geometry;
  const mat =
    props.color === PIECECOLOR_WHITE ? pieceMaterialWhite : pieceMaterialBlack;

  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={geo}
        material={hovered ? pieceMaterialHovered : mat}
        position={[0, 0, 0.21]}
        rotation={new Euler(Math.PI / 2, 0, 0)}
        scale={0.5 * 0.61954057}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
        }}
        onPointerOut={(e) => setHover(false)}
      />
    </group>
  );
};

export { Bishop, King, Knight, Pawn, Queen, Rook };
