import * as THREE from "three";

interface ITextureConfigs {
  map: string;
  normalMap: string;
  specularMap: string;
  cloudsMap: string;
}
interface IEarthTextures {
  map: THREE.Texture;
  normalMap: THREE.Texture;
  specularMap: THREE.Texture;
  cloudsMap: THREE.Texture;
}

export default class Earth {
  private earthTextures: IEarthTextures;
  private radius: number;
  private segments: number;
  private earth!: THREE.Mesh;
  private clouds!: THREE.Mesh;
  private atmosphere!: THREE.Mesh;
  private earthGroup!: THREE.Group;
  constructor(earthMaps: ITextureConfigs, radius: number, segment: number) {
    const textureLoader = new THREE.TextureLoader();
    this.earthTextures = {
      map: textureLoader.load(earthMaps.map),
      normalMap: textureLoader.load(earthMaps.normalMap),
      specularMap: textureLoader.load(earthMaps.specularMap),
      cloudsMap: textureLoader.load(earthMaps.cloudsMap),
    };

    this.radius = radius;
    this.segments = segment;

    this.creteEarthMesh();
    this.createCloudsLayer();
    this.createAtmosphereGlow();
    this.createEarthGroup();
  }

  private creteEarthMesh() {
    // Create Earth material with advanced properties
    const earthMaterial = new THREE.MeshPhongMaterial({
      map: this.earthTextures.map,
      normalMap: this.earthTextures.normalMap,
      specularMap: this.earthTextures.specularMap,
      normalScale: new THREE.Vector2(0.05, 0.05),
      specular: new THREE.Color(0x333333),
      shininess: 30,
      bumpScale: 0.05,
    });

    // Create Earth mesh
    const earthGeometry = new THREE.SphereGeometry(
      this.radius,
      this.segments,
      this.segments
    );
    this.earth = new THREE.Mesh(earthGeometry, earthMaterial);
  }

  private createCloudsLayer() {
    // Create clouds layer
    const cloudsGeometry = new THREE.SphereGeometry(
      this.radius + 0.01,
      this.segments,
      this.segments
    );
    const cloudsMaterial = new THREE.MeshPhongMaterial({
      map: this.earthTextures.cloudsMap,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });
    this.clouds = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
  }

  private createAtmosphereGlow() {
    // Create atmosphere glow
    const atmosphereGeometry = new THREE.SphereGeometry(
      this.radius + 0.02,
      this.segments,
      this.segments
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
    this.atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
  }

  private createEarthGroup() {
    this.earthGroup = new THREE.Group();
    this.earthGroup.add(this.earth);
    this.earthGroup.add(this.clouds);
    this.earthGroup.add(this.atmosphere);
  }

  // Animation function
  animateEarth(deltaTime: number) {
    // Rotate Earth
    this.earth.rotation.y += 0.1 * deltaTime;
    // Rotate clouds slightly faster than Earth
    this.clouds.rotation.y += 0.12 * deltaTime;
  }

  // Function to add Earth to scene
  addEarthToScene(scene: THREE.Scene) {
    scene.add(this.earthGroup);
  }
}
