import "./style.css";
import * as THREE from "three";
import {
  FontLoader,
  OrbitControls,
  TextGeometry,
} from "three/examples/jsm/Addons.js";

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

const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const createFloatingText = async (
  text: string,
  position: THREE.Vector3
): Promise<THREE.Mesh> => {
  return new Promise((resolve, reject) => {
    const loader = new FontLoader();
    loader.load(
      "assets/fonts/Futury_Light_Regular.json",
      (font) => {
        const geometry = new TextGeometry(text, {
          font,
          size: 1.5,
          curveSegments: 12,
          bevelEnabled: true,
          bevelThickness: 0.03,
          bevelSize: 0.02,
          bevelOffset: 0,
          bevelSegments: 5,
          depth: 0.1,
        });

        const material = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          metalness: 0.3,
          roughness: 0.3,
          emissive: 0xffffff,
          clipShadows: true,
        });

        const textMesh = new THREE.Mesh(geometry, material);
        textMesh.position.copy(position);

        geometry.computeBoundingBox();
        const centerOffset = geometry.boundingBox!.getCenter(
          new THREE.Vector3()
        );
        textMesh.position.x -= centerOffset.x;

        scene.add(textMesh);
        resolve(textMesh);
      },
      () => {},
      (err) => {
        console.error("An error occurred when loading the font:", err);
        reject(err);
      }
    );
  });
};

createFloatingText("Hi there!", new THREE.Vector3(0, 15, 0));
createFloatingText(
  "My name is Khoa, and welcome to my world!",
  new THREE.Vector3(0, 11, 0)
)
  .then((textMesh) => {
    // You can animate the text here if desired
    textMesh.rotation.x = 0.2;
  })
  .catch((error) => console.error("Error creating text:", error));

const textureLoader = new THREE.TextureLoader();
const textureMap = textureLoader.load("assets/images/earthmap.jpg");
const geometry = new THREE.SphereGeometry(5, 32, 32);
const material = new THREE.MeshPhongMaterial({
  color: 0xffffff,
  map: textureMap,
  specular: 0x3065ab,
  shininess: 30
});
const globe = new THREE.Mesh(geometry, material);
scene.add(globe);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = false;

const addStar = () => {
  const geometry = new THREE.SphereGeometry(0.25, 24, 24);
  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xd7dfe1,
    envMapIntensity: 0.3,
  });
  const star = new THREE.Mesh(geometry, material);

  const [x, y, z] = Array(3)
    .fill(undefined)
    .map(() => THREE.MathUtils.randFloatSpread(100));
  star.position.set(x, y, z);
  scene.add(star);
};
Array(200).fill(undefined).forEach(addStar);

const animate = () => {
  requestAnimationFrame(animate);

  globe.rotation.y += 0.005;
  controls.update();
  renderer.render(scene, camera);
};

animate();
