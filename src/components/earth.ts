import * as THREE from "three";

// Create texture loader
const textureLoader = new THREE.TextureLoader();

// Load Earth textures
const earthTextures = {
  map: textureLoader.load(
    "assets/textures/earth_atmos_2048.jpg"
  ),
  normalMap: textureLoader.load(
    "assets/textures/earth_normal_2048.jpg"
  ),
  specularMap: textureLoader.load(
    "assets/textures/earth_specular_2048.jpg"
  ),
  cloudsMap: textureLoader.load(
    "assets/textures/earth_clouds_2048.jpg"
  ),
};

// Earth parameters
const EARTH_RADIUS = 7;
const EARTH_SEGMENTS = 64;

// Create Earth material with advanced properties
const earthMaterial = new THREE.MeshPhongMaterial({
  map: earthTextures.map,
  normalMap: earthTextures.normalMap,
  specularMap: earthTextures.specularMap,
  normalScale: new THREE.Vector2(0.05, 0.05),
  specular: new THREE.Color(0x333333),
  shininess: 30,
  bumpScale: 0.05,
});

// Create Earth mesh
const earthGeometry = new THREE.SphereGeometry(
  EARTH_RADIUS,
  EARTH_SEGMENTS,
  EARTH_SEGMENTS
);
const earth = new THREE.Mesh(earthGeometry, earthMaterial);

// Create clouds layer
const cloudsGeometry = new THREE.SphereGeometry(
  EARTH_RADIUS + 0.01,
  EARTH_SEGMENTS,
  EARTH_SEGMENTS
);
const cloudsMaterial = new THREE.MeshPhongMaterial({
  map: earthTextures.cloudsMap,
  transparent: true,
  opacity: 0.9,
  blending: THREE.AdditiveBlending,
});
const clouds = new THREE.Mesh(cloudsGeometry, cloudsMaterial);

// Create atmosphere glow
const atmosphereGeometry = new THREE.SphereGeometry(
  EARTH_RADIUS + 0.02,
  EARTH_SEGMENTS,
  EARTH_SEGMENTS
);
const atmosphereMaterial = new THREE.ShaderMaterial({
  vertexShader: `
        varying vec3 vNormal;
        void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
  fragmentShader: `
        varying vec3 vNormal;
        void main() {
            float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
            gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity;
        }
    `,
  blending: THREE.AdditiveBlending,
  side: THREE.BackSide,
  transparent: true,
});
const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);

// Create Earth group to hold all components
const earthGroup = new THREE.Group();
earthGroup.add(earth);
earthGroup.add(clouds);
earthGroup.add(atmosphere);

// Animation function
function animateEarth(deltaTime: number) {
  // Rotate Earth
  earth.rotation.y +=0.1 * deltaTime;
  // Rotate clouds slightly faster than Earth
  clouds.rotation.y += 0.12 * deltaTime;
}

// Function to add Earth to scene
function addEarthToScene(scene: THREE.Scene) {
  scene.add(earthGroup);
}

export {
  earthGroup,
  addEarthToScene,
  animateEarth,
};
