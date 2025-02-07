import * as THREE from "three";

export default class Star {
  geometry: THREE.SphereGeometry;
  material: THREE.MeshStandardMaterial;
  constructor() {
    this.geometry = new THREE.SphereGeometry(0.1, 24, 24);
    this.material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xd7dfe1,
      envMapIntensity: 0.3,
    });
  }

  addStarToScene = (scene: THREE.Scene) => {
    const star = new THREE.Mesh(this.geometry, this.material);

    const [x, y, z] = Array(3)
      .fill(undefined)
      .map(() => THREE.MathUtils.randFloatSpread(100));
    star.position.set(x, y, z);
    scene.add(star);
  };
}
