import React, {
  useCallback,
  useState,
} from "react";
import { MeshPhysicalMaterial, BoxBufferGeometry, Euler } from "three";
import { Text } from "@react-three/drei";
import {
  BOARD_ROWS,
  BOARD_COLS,
  TILESIZE,
  TILEDEPTH,
  TILECOLOR_WHITE,
  TILECOLOR_BLACK,
  TILECOLOR_HOVER,
  TILECOLOR_POSSIBLE,
  BOARD_COLNAMES,
  BOARD_ROWNAMES,
  BOARD_LABELSCALE,
  calcTilePosition,
  convertCoord2Notation,
  BOARD_COLNAMES_LONG,
} from "../helpers/chessHelper";

// DEBUG
const debugChessBoard = false;

// Re-use materials and geometries
export const tileMaterialWhite = new MeshPhysicalMaterial({
  color: TILECOLOR_WHITE,
});

export const tileMaterialBlack = new MeshPhysicalMaterial({
  color: TILECOLOR_BLACK,
});

export const tileMaterialHover = new MeshPhysicalMaterial({
  color: TILECOLOR_HOVER,
});

export const tileMaterialPossible = new MeshPhysicalMaterial({
  color: TILECOLOR_POSSIBLE,
});

const tileGeometry = new BoxBufferGeometry(TILESIZE, TILESIZE, TILEDEPTH);

//
// ChessBoard: Tiles & Labels
//
const ChessBoard = (props: any) => {
  debugChessBoard && console.log("ChessBoard");

  // create all tiles - TO-DO : Instancing
  const Tiles = useCallback(() => {
    // create a single tile at default position - decides color & gives name
    const Tile = (props: any) => {
      //debugChessBoard && console.log("--SingleTile");
      //
      const { row, col } = props;
      // state
      const [hovered, setHover] = useState(false);
      // decide color
      let tileMat;
      (row + col) % 2 === 0
        ? (tileMat = tileMaterialBlack)
        : (tileMat = tileMaterialWhite);
      // tile name
      const tileName = convertCoord2Notation(row, col); // boardColNames[col].toLowerCase() + boardRowNames[row];
      debugChessBoard && console.log(tileName);
      // position
      const pos = calcTilePosition(row, col);
      // ref
      //const tileRef = React.createRef<Mesh>();
      //const tileRef = useRef();
      //
      return (
        <mesh
          key={tileName}
          //ref={tileRef}
          name={tileName}
          position={pos}
          geometry={tileGeometry}
          material={hovered ? tileMaterialHover : tileMat}
          receiveShadow
          castShadow
          onClick={(e) => {
            e.stopPropagation();
            debugChessBoard && console.log(tileName);
            //tileRef.current!.material! = tileMaterialHover;
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            debugChessBoard && console.log(tileName);
            setHover(true);
          }}
          onPointerOut={(e) => setHover(false)}
        />
      );
    }; // Tile

    debugChessBoard && console.log("-Tiles");
    //
    let tiles: JSX.Element[] = [];
    // loop rows
    for (let row = 0; row < BOARD_ROWS; row++) {
      // loop columns
      for (let col = 0; col < BOARD_COLS; col++) {
        // tile generation
        // tiles.push(Tile(row, col));
        const id = BOARD_COLNAMES[col] + BOARD_ROWNAMES[row];
        tiles.push(<Tile key={id} name={id} row={row} col={col} />);
      }
    }
    //
    return <>{tiles}</>;
  }, []); // Tiles

  //
  // Labels
  const RowLabels = useCallback(() => {
    debugChessBoard && console.log("-RowLabels");
    //
    let labels: JSX.Element[] = [];
    // loop rows
    for (let row = 0; row < BOARD_ROWS; row++) {
      // row Text
      labels.push(
        <group key={BOARD_ROWNAMES[row]} name={BOARD_ROWNAMES[row]}>
          <Text
            name={BOARD_ROWNAMES[row]}
            color="#f33"
            anchorX="center"
            anchorY="middle"
            font="Roboto"
            fontSize={12}
            scale={BOARD_LABELSCALE}
            position={[-TILESIZE / 4, row + TILESIZE / 2, 0]}
          >
            {BOARD_ROWNAMES[row]}
          </Text>
          <Text
            color="#f33"
            anchorX="center"
            anchorY="middle"
            font="Roboto"
            fontSize={12}
            scale={BOARD_LABELSCALE}
            rotation={new Euler(0, 0, Math.PI)}
            position={[
              TILESIZE * BOARD_COLS + TILESIZE / 4,
              row + TILESIZE / 2,
              0,
            ]}
          >
            {BOARD_ROWNAMES[row]}
          </Text>
        </group>,
      );
    }
    //
    return <>{labels}</>;
  }, []); // RowLabels

  const ColLabels = useCallback(() => {
    debugChessBoard && console.log("-ColLabels");
    //
    let labels: JSX.Element[] = [];
    // loop columns
    for (let col = 0; col < BOARD_COLS; col++) {
      // col Text
      labels.push(
        <group key={BOARD_COLNAMES[col]} name={BOARD_COLNAMES[col]}>
          <Text
            color="#f33"
            anchorX="center"
            anchorY="middle"
            font="Roboto"
            fontSize={12}
            scale={BOARD_LABELSCALE}
            position={[col + TILESIZE / 2, -TILESIZE / 2, 0]}
          >
            {BOARD_COLNAMES[col]}
          </Text>
          <Text
            color="#f33"
            anchorX="center"
            anchorY="middle"
            font="Roboto"
            fontSize={7}
            scale={BOARD_LABELSCALE}
            position={[col + TILESIZE / 2, -TILESIZE, 0]}
          >
            {BOARD_COLNAMES_LONG[col]}
          </Text>
          <Text
            color="#f33"
            anchorX="center"
            anchorY="middle"
            font="Roboto"
            fontSize={12}
            scale={BOARD_LABELSCALE}
            rotation={new Euler(0, 0, Math.PI)}
            position={[
              col + TILESIZE / 2,
              TILESIZE * BOARD_COLS + TILESIZE / 2,
              0,
            ]}
          >
            {BOARD_COLNAMES[col]}
          </Text>
          <Text
            color="#f33"
            anchorX="center"
            anchorY="middle"
            font="Roboto"
            fontSize={7}
            scale={BOARD_LABELSCALE}
            rotation={new Euler(0, 0, Math.PI)}
            position={[col + TILESIZE / 2, TILESIZE * BOARD_COLS + TILESIZE, 0]}
          >
            {BOARD_COLNAMES_LONG[col]}
          </Text>
        </group>,
      );
    }
    //
    return <>{labels}</>;
  }, []); // ColLabels

  //
  return (
    <group>
      <Tiles key="tiles" />
      <RowLabels key="rowlabels" />
      <ColLabels key="collabels" />
    </group>
  );
};

export { ChessBoard };
