import * as THREE from "three";
import { FontLoader, TextGeometry } from "three/examples/jsm/Addons.js";

const addFloatingTextToScene = async (
  scene: THREE.Scene,
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

export { addFloatingTextToScene };
