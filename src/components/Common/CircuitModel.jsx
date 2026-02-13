import React, { useEffect, useMemo, useRef, useState } from "react";

const STL_MODULES = import.meta.glob("../../assets/circuits/*.stl", {
  query: "?url",
  import: "default",
});

const MODEL_MAP = [
  { keys: ["melbourne", "albert park", "australian"], file: "1-melbourne.stl" },
  { keys: ["shanghai", "chinese"], file: "2-shanghai.stl" },
  { keys: ["suzuka", "japanese"], file: "3-suzuka.stl" },
  { keys: ["sakhir", "bahrain", "bahrain international"], file: "4-sakhir.stl" },
  { keys: ["jeddah", "jeddah corniche", "saudi"], file: "5-jeddah.stl" },
  { keys: ["miami"], file: "6-miami-gardens.stl" },
  { keys: ["imola", "emilia-romagna", "enzo e dino ferrari"], file: "7-imola.stl" },
  { keys: ["monaco", "monte carlo"], file: "8-monaco.stl" },
  { keys: ["barcelona", "catalunya", "spanish", "barcelona-catalunya"], file: "9-barcelona.stl" },
  { keys: ["montreal", "gilles villeneuve", "canadian"], file: "10-montreal.stl" },
  { keys: ["spielberg", "red bull ring", "austrian"], file: "11-spielberg.stl" },
  { keys: ["silverstone", "british"], file: "12-silverstone.stl" },
  { keys: ["spa", "francorchamps", "spa-francorchamps", "belgian"], file: "13-spa.stl" },
  { keys: ["budapest", "hungaroring", "hungarian"], file: "14-budapest.stl" },
  { keys: ["zandvoort", "dutch"], file: "15-zandvoort.stl" },
  { keys: ["monza", "autodromo nazionale", "italian"], file: "16-monza.stl" },
  { keys: ["baku", "azerbaijan"], file: "17-baku.stl" },
  { keys: ["singapore"], file: "18-singapore.stl" },
  { keys: ["austin", "cota", "united states"], file: "19-austin.stl" },
  { keys: ["mexico", "mexico city", "mexican"], file: "20-mexico-city.stl" },
  { keys: ["sao paulo", "são paulo", "interlagos", "brazilian"], file: "21-sao-paulo.stl" },
  { keys: ["las vegas"], file: "22-las-vegas.stl" },
  { keys: ["lusail", "losail", "qatar"], file: "23-lusail.stl" },
  { keys: ["yas marina", "abu dhabi", "abu dhabi grand prix"], file: "24-yas-marina.stl" },
];

const normalize = (value = "") => value.toLowerCase().replace(/[^a-z0-9\s-]/g, "");

const resolveModelFile = (circuitName, location) => {
  const search = `${normalize(circuitName)} ${normalize(location)}`;
  return MODEL_MAP.find((entry) => entry.keys.some((key) => search.includes(key)))?.file;
};

const getPrimaryColor = () => {
  if (typeof window === "undefined") return "#ff2d2d";
  const value = getComputedStyle(document.documentElement).getPropertyValue("--primary-color");
  return value?.trim() || "#ff2d2d";
};

const getModuleLoader = (fileName) => STL_MODULES[`../../assets/circuits/${fileName}`];

const CircuitModel = ({
  circuitName,
  location,
  size = 150,
  width,
  height,
  enabled = true,
  defer = false,
}) => {
  const mountRef = useRef(null);
  const [status, setStatus] = useState("idle");
  const [isVisible, setIsVisible] = useState(!defer);

  const modelWidth = width || size;
  const modelHeight = height || size;

  const modelFile = useMemo(
    () => resolveModelFile(circuitName, location),
    [circuitName, location]
  );

  useEffect(() => {
    if (!defer) {
      setIsVisible(true);
      return undefined;
    }

    const mount = mountRef.current;
    if (!mount) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(mount);
    return () => observer.disconnect();
  }, [defer]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    if (!enabled) {
      setStatus("disabled");
      return undefined;
    }

    if (!modelFile) {
      setStatus("missing");
      return undefined;
    }

    if (!isVisible) {
      setStatus("idle");
      return undefined;
    }

    let canceled = false;
    let frame = null;
    let observer;
    let renderer;
    let scene;
    let camera;
    let mesh;
    let geometry;
    let material;
    let mounted = true;
    let isDocumentVisible = !document.hidden;

    const setup = async () => {
      setStatus("loading");

      try {
        const [THREE, loaderModule] = await Promise.all([
          import("three"),
          import("three/examples/jsm/loaders/STLLoader.js"),
        ]);
        if (canceled || !mounted) return;

        const modelLoader = getModuleLoader(modelFile);
        if (!modelLoader) {
          setStatus("missing");
          return;
        }

        const modelPath = await modelLoader();
        if (canceled || !mounted) return;

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(18, 1, 0.1, 10000);
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setClearColor(0x000000, 0);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        mount.appendChild(renderer.domElement);

        const ambient = new THREE.AmbientLight(0xffffff, 0.7);
        const directional = new THREE.DirectionalLight(0xffffff, 0.9);
        directional.position.set(5, 10, 8);
        scene.add(ambient, directional);

        const STLLoader = loaderModule.STLLoader;
        const loader = new STLLoader();

        loader.load(
          modelPath,
          (loadedGeometry) => {
            if (canceled || !mounted) return;

            geometry = loadedGeometry;
            geometry.computeBoundingBox();
            geometry.center();

            material = new THREE.MeshStandardMaterial({
              color: new THREE.Color(getPrimaryColor()),
              metalness: 0.25,
              roughness: 0.52,
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

            const resize = () => {
              if (!renderer || !camera || !mount) return;
              const nextWidth = mount.clientWidth || modelWidth;
              const nextHeight = mount.clientHeight || modelHeight;
              renderer.setSize(nextWidth, nextHeight);
              camera.aspect = nextWidth / nextHeight;
              camera.updateProjectionMatrix();
            };

            resize();
            observer = new ResizeObserver(resize);
            observer.observe(mount);

            const render = () => {
              frame = requestAnimationFrame(render);
              if (!mesh || !renderer || !camera || !isDocumentVisible) return;
              mesh.rotation.z += 0.002;
              renderer.render(scene, camera);
            };

            setStatus("ready");
            render();
          },
          undefined,
          () => {
            if (!canceled) {
              setStatus("error");
            }
          }
        );
      } catch (error) {
        if (!canceled) {
          console.error("Circuit model loading error", error);
          setStatus("error");
        }
      }
    };

    const handleVisibilityChange = () => {
      isDocumentVisible = !document.hidden;
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    setup();

    return () => {
      canceled = true;
      mounted = false;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (frame) cancelAnimationFrame(frame);
      if (observer) observer.disconnect();
      if (mesh && scene) scene.remove(mesh);
      if (geometry) geometry.dispose();
      if (material) material.dispose();
      if (renderer) {
        renderer.dispose();
        if (renderer.domElement && mount.contains(renderer.domElement)) {
          mount.removeChild(renderer.domElement);
        }
      }
    };
  }, [enabled, isVisible, modelFile, modelWidth, modelHeight]);

  if (!enabled) {
    return (
      <div
        className="flex items-center justify-center rounded-xl border border-[var(--border-color)] bg-[var(--panel-color)]/60 text-[10px] uppercase tracking-[0.3em] opacity-60"
        style={{ width: modelWidth, height: modelHeight }}
      >
        3D Off
      </div>
    );
  }

  if (!modelFile) {
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
      className="rounded-xl border border-[var(--border-color)]/40 bg-black/15 overflow-hidden"
      style={{ width: modelWidth, height: modelHeight }}
      aria-label={`Circuit model for ${circuitName || location}`}
    >
      {status !== "ready" && (
        <div className="h-full flex items-center justify-center text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">
          {status === "loading" ? "Loading Model" : "Standby"}
        </div>
      )}
    </div>
  );
};

export default CircuitModel;
