import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { subsolarPoint, toEarthVector } from "../../lib/solar.ts";
import { Earth } from "./earth.ts";
import { GlobeLight } from "./globeLight.ts";

const HANOI = { latDeg: 21.03, lonDeg: 105.85 };
const EARTH_RADIUS = 10;
const SEGMENTS = 64;
const CAMERA_DISTANCE = 42;
/** Radius (scene units) that must fit inside the narrower canvas side. */
const FIT_RADIUS = 12.5;
const SUN_UPDATE_MS = 60_000;

export interface MountGlobeOptions {
  onReady: () => void;
  onFail: () => void;
  /** Clock used for the sun position; defaults to the real time. */
  now?: () => Date;
}

const DEG = Math.PI / 180;

export async function mountGlobe(
  container: HTMLElement,
  opts: MountGlobeOptions,
): Promise<{ dispose: () => void }> {
  const now = opts.now ?? (() => new Date());

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  } catch {
    opts.onFail();
    return { dispose: () => {} };
  }
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const canvas = renderer.domElement;
  canvas.style.display = "block";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  container.appendChild(canvas);

  const scene = new THREE.Scene(); // no background: the starfield is CSS
  const camera = new THREE.PerspectiveCamera(35, 1, 1, 200);
  camera.position.set(0, 0, CAMERA_DISTANCE);

  let ready = false;
  let failed = false;
  const manager = new THREE.LoadingManager();
  const earth = new Earth(EARTH_RADIUS, SEGMENTS, manager);
  const group = earth.getGroup();
  scene.add(group);

  const light = new GlobeLight();
  light.addTo(group, scene);

  // Bring Hanoi to +Z (towards the camera) with north still up: spin about
  // Y so its meridian faces the camera, then tilt about X by its latitude.
  // Euler order "XYZ" applies the Y rotation first.
  group.rotation.set(HANOI.latDeg * DEG, -Math.PI / 2 - HANOI.lonDeg * DEG, 0);

  const render = () => {
    if (ready) renderer.render(scene, camera);
  };

  const updateSun = () => {
    const { latDeg, lonDeg } = subsolarPoint(now());
    light.setSunDirection(toEarthVector(latDeg, lonDeg));
  };
  updateSun();
  const interval = window.setInterval(() => {
    updateSun();
    render();
  }, SUN_UPDATE_MS);

  manager.onError = () => {
    if (failed) return;
    failed = true;
    opts.onFail();
  };
  manager.onLoad = () => {
    // LoadingManager also reaches onLoad after an error; ignore that case.
    if (failed) return;
    ready = true;
    render();
    opts.onReady();
  };

  const resize = () => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (width === 0 || height === 0) return;
    renderer.setSize(width, height, false);
    const aspect = width / height;
    camera.aspect = aspect;
    // Fit FIT_RADIUS in the narrower dimension.
    const halfHeight = aspect >= 1 ? FIT_RADIUS : FIT_RADIUS / aspect;
    camera.fov = (2 * Math.atan(halfHeight / CAMERA_DISTANCE)) / DEG;
    camera.updateProjectionMatrix();
    render();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(container);
  resize();

  let controls: OrbitControls | null = null;
  if (window.matchMedia("(pointer: fine)").matches) {
    controls = new OrbitControls(camera, canvas);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.autoRotate = false;
    controls.addEventListener("change", render);
    // OrbitControls sets touch-action: none, which would block page scroll.
    canvas.style.touchAction = "pan-y";
  } else {
    canvas.style.pointerEvents = "none";
  }

  return {
    dispose: () => {
      window.clearInterval(interval);
      observer.disconnect();
      controls?.dispose();
      earth.dispose();
      renderer.dispose();
      canvas.remove();
    },
  };
}
