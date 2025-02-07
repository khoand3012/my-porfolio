import * as THREE from "three";
import {
  Font,
  TextGeometry,
} from "three/examples/jsm/Addons.js";

export default class FloatingText {
  geometry: TextGeometry;
  material: THREE.MeshStandardMaterial;
  textMesh: THREE.Mesh<any, any, THREE.Object3DEventMap>;
  constructor(text: string, font: Font) {
    this.geometry = new TextGeometry(text, {
      font,
      size: 1,
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.02,
      bevelOffset: 0,
      bevelSegments: 5,
      depth: 0.1,
    });

    this.material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.3,
      roughness: 0.3,
      emissive: 0xffffff,
      clipShadows: true,
    });

    this.textMesh = new THREE.Mesh(this.geometry, this.material);
  }

  addFloatingTextToScene = (
    scene: THREE.Scene,
    position: THREE.Vector3
  ): void => {
    this.textMesh.position.copy(position);

    this.geometry.computeBoundingBox();
    const centerOffset = this.geometry.boundingBox!.getCenter(
      new THREE.Vector3()
    );
    this.textMesh.position.x -= centerOffset.x;

    scene.add(this.textMesh);
  };
}
