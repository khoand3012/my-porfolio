import * as THREE from "three";

export class GlobeLight {
  private sunLight: THREE.DirectionalLight;
  private ambientLight: THREE.AmbientLight;
  constructor(
    sunLight: THREE.DirectionalLight,
    sunLightPos: [number, number, number],
    ambientLight: THREE.AmbientLight
  ) {
    // Create a directional light for the sun
    this.sunLight = sunLight;
    this.sunLight.intensity = 0.8;
    this.sunLight.castShadow = true;
    // Position the light to shine from above and slightly to the side
    this.sunLight.position.set(...sunLightPos);

    // Add ambient light for better overall illumination
    this.ambientLight = ambientLight;
    this.ambientLight.intensity = 0.3;
  }

  addLightToScene(scene: THREE.Scene) {
    scene.add(this.sunLight);
    scene.add(this.ambientLight);

    //   const helper = new THREE.DirectionalLightHelper(sunLight, 5);
    //   scene.add(helper);
  }
}
