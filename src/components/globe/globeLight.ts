import * as THREE from "three";

const SUN_DISTANCE = 100;

/**
 * Sun + ambient light. The sun is parented to the Earth group so that a
 * direction from `toEarthVector` is in the same frame as the globe; its
 * target sits at the scene origin (the Earth's centre).
 */
export class GlobeLight {
  private sunLight: THREE.DirectionalLight;
  private ambientLight: THREE.AmbientLight;

  constructor() {
    this.sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
    this.ambientLight = new THREE.AmbientLight(0x404040, 0.3);
  }

  /**
   * Add the lights. Call this before adding any other directional light:
   * the night-lights shader patch reads `directionalLights[0]`.
   */
  addTo(earthGroup: THREE.Group, scene: THREE.Scene) {
    earthGroup.add(this.sunLight);
    scene.add(this.sunLight.target);
    this.sunLight.target.position.set(0, 0, 0);
    scene.add(this.ambientLight);
  }

  setSunDirection(v: [number, number, number]): void {
    this.sunLight.position
      .set(v[0], v[1], v[2])
      .normalize()
      .multiplyScalar(SUN_DISTANCE);
  }
}
