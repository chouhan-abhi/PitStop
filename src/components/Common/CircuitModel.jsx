import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";

import melbourneStl from "../../assets/circuits/1-melbourne.stl";
import shanghaiStl from "../../assets/circuits/2-shanghai.stl";
import suzukaStl from "../../assets/circuits/3-suzuka.stl";
import sakhirStl from "../../assets/circuits/4-sakhir.stl";
import jeddahStl from "../../assets/circuits/5-jeddah.stl";
import miamiStl from "../../assets/circuits/6-miami-gardens.stl";
import imolaStl from "../../assets/circuits/7-imola.stl";
import monacoStl from "../../assets/circuits/8-monaco.stl";
import barcelonaStl from "../../assets/circuits/9-barcelona.stl";
import montrealStl from "../../assets/circuits/10-montreal.stl";
import spielbergStl from "../../assets/circuits/11-spielberg.stl";
import silverstoneStl from "../../assets/circuits/12-silverstone.stl";
import spaStl from "../../assets/circuits/13-spa.stl";
import budapestStl from "../../assets/circuits/14-budapest.stl";
import zandvoortStl from "../../assets/circuits/15-zandvoort.stl";
import monzaStl from "../../assets/circuits/16-monza.stl";
import bakuStl from "../../assets/circuits/17-baku.stl";
import singaporeStl from "../../assets/circuits/18-singapore.stl";
import austinStl from "../../assets/circuits/19-austin.stl";
import mexicoCityStl from "../../assets/circuits/20-mexico-city.stl";
import saoPauloStl from "../../assets/circuits/21-sao-paulo.stl";
import lasVegasStl from "../../assets/circuits/22-las-vegas.stl";
import lusailStl from "../../assets/circuits/23-lusail.stl";
import yasMarinaStl from "../../assets/circuits/24-yas-marina.stl";

const MODEL_MAP = [
  { keys: ["melbourne", "albert park", "australian"], file: melbourneStl },
  { keys: ["shanghai", "chinese"], file: shanghaiStl },
  { keys: ["suzuka", "japanese"], file: suzukaStl },
  { keys: ["sakhir", "bahrain", "bahrain international"], file: sakhirStl },
  { keys: ["jeddah", "jeddah corniche", "saudi"], file: jeddahStl },
  { keys: ["miami"], file: miamiStl },
  { keys: ["imola", "emilia-romagna", "enzo e dino ferrari"], file: imolaStl },
  { keys: ["monaco", "monte carlo"], file: monacoStl },
  { keys: ["barcelona", "catalunya", "spanish", "barcelona-catalunya"], file: barcelonaStl },
  { keys: ["montreal", "gilles villeneuve", "canadian"], file: montrealStl },
  { keys: ["spielberg", "red bull ring", "austrian"], file: spielbergStl },
  { keys: ["silverstone", "british"], file: silverstoneStl },
  { keys: ["spa", "francorchamps", "spa-francorchamps", "belgian"], file: spaStl },
  { keys: ["budapest", "hungaroring", "hungarian"], file: budapestStl },
  { keys: ["zandvoort", "dutch"], file: zandvoortStl },
  { keys: ["monza", "autodromo nazionale", "italian"], file: monzaStl },
  { keys: ["baku", "azerbaijan"], file: bakuStl },
  { keys: ["singapore"], file: singaporeStl },
  { keys: ["austin", "cota", "united states"], file: austinStl },
  { keys: ["mexico", "mexico city", "mexican"], file: mexicoCityStl },
  { keys: ["sao paulo", "são paulo", "interlagos", "brazilian"], file: saoPauloStl },
  { keys: ["las vegas"], file: lasVegasStl },
  { keys: ["lusail", "losail", "qatar"], file: lusailStl },
  { keys: ["yas marina", "abu dhabi", "abu dhabi grand prix"], file: yasMarinaStl },
];

const normalize = (value = "") =>
  value.toLowerCase().replace(/[^a-z0-9\\s-]/g, "");

const resolveModel = (circuitName, location) => {
  const search = `${normalize(circuitName)} ${normalize(location)}`;
  return MODEL_MAP.find((entry) =>
    entry.keys.some((key) => search.includes(key))
  )?.file;
};

const getPrimaryColor = () => {
  if (typeof window === "undefined") return "#ff4d4d";
  const value = getComputedStyle(document.documentElement).getPropertyValue(
    "--primary-color"
  );
  return value?.trim() || "#ff4d4d";
};

const CircuitModel = ({ circuitName, location, size = 150, width, height }) => {
  const mountRef = useRef(null);
  const [status, setStatus] = useState("loading");
  const modelWidth = width || size;
  const modelHeight = height || size;
  const modelPath = useMemo(
    () => resolveModel(circuitName, location),
    [circuitName, location]
  );

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || !modelPath) {
      setStatus("missing");
      return undefined;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(18, 1, 0.1, 10000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    mount.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    const directional = new THREE.DirectionalLight(0xffffff, 0.9);
    directional.position.set(5, 10, 8);
    scene.add(ambient, directional);

    const loader = new STLLoader();
    let mesh;
    let frame;

    loader.load(
      modelPath,
      (geometry) => {
        setStatus("ready");
        geometry.computeBoundingBox();
        geometry.center();
        const material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(getPrimaryColor()),
          metalness: 0.25,
          roughness: 0.5,
        });
        mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = -Math.PI / 2;
        mesh.rotation.z = Math.PI / 6;
        scene.add(mesh);

        const box = new THREE.Box3().setFromObject(mesh);
        const sizeVec = new THREE.Vector3();
        box.getSize(sizeVec);
        const maxDim = Math.max(sizeVec.x, sizeVec.y, sizeVec.z);
        camera.position.set(0, maxDim * 0.9, maxDim * 1.6);
        camera.lookAt(0, 0, 0);

        const render = () => {
          frame = requestAnimationFrame(render);
          mesh.rotation.z += 0.002;
          renderer.render(scene, camera);
        };
        render();
      },
      undefined,
      () => {
        setStatus("error");
      }
    );

    const resize = () => {
      const nextWidth = mount.clientWidth || modelWidth;
      const nextHeight = mount.clientHeight || modelHeight;
      renderer.setSize(nextWidth, nextHeight);
      camera.aspect = nextWidth / nextHeight;
      camera.updateProjectionMatrix();
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(mount);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      observer.disconnect();
      if (mesh) {
        mesh.geometry.dispose();
        mesh.material.dispose();
      }
      renderer.dispose();
      if (renderer.domElement && mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [modelPath, size]);

  if (!modelPath) {
    return (
      <div
        className="flex items-center justify-center rounded-xl border border-[var(--border-color)] bg-[var(--panel-color)]/60 text-[10px] uppercase tracking-[0.3em] opacity-60"
        style={{ width: modelWidth, height: modelHeight }}
      >
        Circuit
      </div>
    );
  }

  if (status === "error") {
    return (
      <div
        className="flex items-center justify-center rounded-xl border border-[var(--border-color)] bg-[var(--panel-color)]/60 text-[10px] uppercase tracking-[0.3em] opacity-60"
        style={{ width: modelWidth, height: modelHeight }}
      >
        Model Error
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      className="rounded-xl"
      style={{ width: modelWidth, height: modelHeight }}
      aria-label={`Circuit model for ${circuitName || location}`}
    />
  );
};

export default CircuitModel;
