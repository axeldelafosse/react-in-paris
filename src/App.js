import React, { useRef, Suspense, useEffect } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { LayerMaterial, Base, Depth, Fresnel } from "lamina";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter";
import { saveAs } from "file-saver";

const EXPORT = false;

export default function App() {
  return (
    <Canvas dpr={[1, 2]}>
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </Canvas>
  );
}

function Scene() {
  const props = {
    base: "#61dafb",
    colorA: "#61dafb",
    colorB: "#0070ff",
  };
  const { scene } = useThree();

  useEffect(() => {
    if (EXPORT) {
      download(scene);
    }
  }, [scene]);

  return (
    <group>
      {EXPORT ? <></> : <Bg {...props} />}
      <Logo {...props} />
      <mesh>
        <sphereGeometry args={[0.2, 64, 64]} />
        <meshPhysicalMaterial
          color={EXPORT ? "#fff" : props.base}
          transparent={EXPORT ? false : true}
          transmission={EXPORT ? 0.15 : 1}
          thickness={10}
          roughness={EXPORT ? 0.5 : 0.69}
          ior={1.4}
        />
      </mesh>
      <OrbitControls enableZoom={false} />
      <pointLight position={[10, 10, 5]} />
      <pointLight position={[-10, -10, -5]} color={props.colorA} />
      <ambientLight intensity={0.4} />
      <Environment preset="warehouse" />
    </group>
  );
}

function Bg({ base, colorA, colorB }) {
  const mesh = useRef();
  useFrame((state, delta) => {
    mesh.current.rotation.x =
      mesh.current.rotation.y =
      mesh.current.rotation.z +=
        delta / 10;
  });

  return (
    <mesh ref={mesh} scale={100}>
      <sphereGeometry args={[1, 64, 64]} />
      <LayerMaterial attach="material" side={THREE.BackSide}>
        <Base color={base} alpha={1} mode="normal" />
        <Depth
          colorA={colorB}
          colorB={colorA}
          alpha={0.5}
          mode="normal"
          near={0}
          far={300}
          origin={[100, 100, 100]}
        />
      </LayerMaterial>
    </mesh>
  );
}

function Logo({ base, colorA, colorB }) {
  const mesh = useRef();
  const depth = useRef();
  useFrame((state, delta) => {
    mesh.current.rotation.z -= delta / 2;
    depth.current.origin.set(-state.mouse.y, state.mouse.x, 0);
  });

  return (
    <mesh scale={[2, 2, 2]} ref={mesh}>
      <torusKnotGeometry args={[0.42, 0.055, 420, 20, 2, 12]} />
      {EXPORT ? (
        <meshPhysicalMaterial color="#fff" />
      ) : (
        <LayerMaterial>
          <Base color={base} alpha={1} mode="normal" />
          <Depth
            colorA={colorB}
            colorB={colorA}
            alpha={0.5}
            mode="normal"
            near={0}
            far={3}
            origin={[1, 1, 1]}
          />
          <Depth
            ref={depth}
            colorA={colorB}
            colorB="black"
            alpha={1}
            mode="lighten"
            near={0.25}
            far={2}
            origin={[1, 0, 0]}
          />
          <Fresnel
            mode="softlight"
            color="white"
            intensity={0.3}
            power={2}
            bias={0}
          />
        </LayerMaterial>
      )}
    </mesh>
  );
}

function download(scene) {
  const exporter = new GLTFExporter();
  exporter.parse(
    scene,
    function (gltf) {
      console.log(gltf);
      saveArrayBuffer(gltf, "scene.glb");
    },
    function (error) {
      console.error(error);
    },
    { binary: true }
  );
}

function saveArrayBuffer(buffer, filename) {
  saveAs(new Blob([buffer], { type: "application/octet-stream" }), filename);
}
