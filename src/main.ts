import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { addLightToScene } from "./components/globe-light";
import { addEarthToScene, animateEarth } from "./components/earth";
import { addStarToScene } from "./components/star";
import { addFloatingTextToScene } from "./components/floatingText";

const NUM_OF_STARS = 200;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas: document.querySelector("#bg") as HTMLCanvasElement,
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);

addLightToScene(scene);

addFloatingTextToScene(scene, "Hi there!", new THREE.Vector3(0, 15, 0));
addFloatingTextToScene(
  scene,
  "My name is Khoa, and welcome to my world!",
  new THREE.Vector3(0, 11, 0)
);
addEarthToScene(scene);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = false;

for (let i = 0; i < NUM_OF_STARS; i++) {
  addStarToScene(scene);
}
const clock = new THREE.Clock();

const animate = () => {
  const deltaTime = clock.getDelta();
  animateEarth(deltaTime);
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
};

animate();
