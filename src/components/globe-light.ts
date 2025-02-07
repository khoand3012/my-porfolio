import * as THREE from "three";
// Create a directional light for the sun
const sunLight = new THREE.DirectionalLight(0xffffff, 3);
// Position the light to shine from above and slightly to the side
sunLight.position.set(5, 3, 4.5);

// Optional: Add ambient light for better overall illumination
const ambientLight = new THREE.AmbientLight(0x404040, 0.8);

// Assuming you have a scene already created
function addLightToScene(scene: THREE.Scene) {
  scene.add(sunLight);
  scene.add(ambientLight);

//   const helper = new THREE.DirectionalLightHelper(sunLight, 5);
//   scene.add(helper);
}

export { sunLight, addLightToScene };
