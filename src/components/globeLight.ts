import * as THREE from "three";

export default class GlobeLight {
  private sunLight: THREE.DirectionalLight;
  private ambientLight: THREE.AmbientLight;
  constructor(
    sunLight: THREE.DirectionalLight,
    sunLightPos: [number, number, number],
    ambientLight: THREE.AmbientLight
  ) {
    // Create a directional light for the sun
    this.sunLight = sunLight;
    // Position the light to shine from above and slightly to the side
    this.sunLight.position.set(...sunLightPos);

    // Add ambient light for better overall illumination
    this.ambientLight = ambientLight;
  }

  addLightToScene(scene: THREE.Scene) {
    scene.add(this.sunLight);
    scene.add(this.ambientLight);

    //   const helper = new THREE.DirectionalLightHelper(sunLight, 5);
    //   scene.add(helper);
  }
}
