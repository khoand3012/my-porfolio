import * as THREE from "three";
import vertexShader from "../shaders/vertex.glsl";
import fragmentShader from "../shaders/fragment.glsl";
import { ProgressBarManager } from "../utils/progressBarManager";

interface IEarthMappings {
  albedoMap: THREE.Texture;
  bumpMap: THREE.Texture;
  cloudsMap: THREE.Texture;
  oceanMap: THREE.Texture;
  lightsMap: THREE.Texture;
}

const params = {
  sunIntensity: 1.3,
  speedFactor: 2.0,
  metalness: 0.1,
  atmOpacity: { value: 0.7 },
  atmPowFactor: { value: 4.1 },
  atmMultiplier: { value: 9.5 },
};

export class Earth {
  private radius: number;
  private segments: number;
  private earth!: THREE.Mesh;
  private clouds!: THREE.Mesh;
  private atmosphere!: THREE.Mesh;
  private earthGroup!: THREE.Group;
  private earthMappings!: IEarthMappings;
  constructor(radius: number, segment: number) {
    this.radius = radius;
    this.segments = segment;
    this.loadEarthTextures();
    this.createEarthMesh();
    this.createCloudsLayer();
    this.createAtmosphereGlow();
    this.createEarthGroup();
  }

  private loadEarthTextures() {
    const textureLoader = new THREE.TextureLoader();
    const progressBarManager = ProgressBarManager.getInstance();

    const albedoMap = textureLoader.load("assets/textures/Albedo.jpg", () => {
      progressBarManager.updateProgress(20, "Loading Earth map...");
    });
    const bumpMap = textureLoader.load("assets/textures/Bump.jpg", () => {
      progressBarManager.updateProgress(20, "Loading bump map...");
    });
    const cloudsMap = textureLoader.load("assets/textures/Clouds.png", () => {
      progressBarManager.updateProgress(20, "Loading clouds map...");
    });
    const oceanMap = textureLoader.load("assets/textures/Ocean.png", () => {
      progressBarManager.updateProgress(20, "Loading ocean map...");
    });
    const lightsMap = textureLoader.load(
      "assets/textures/night_lights_modified.png",
      () => {
        progressBarManager.updateProgress(10, "Loading night lights...");
      }
    );

    this.earthMappings = {
      albedoMap,
      bumpMap,
      cloudsMap,
      oceanMap,
      lightsMap,
    };

    this.earthMappings.albedoMap.colorSpace = THREE.SRGBColorSpace;
  }

  private createEarthMesh() {
    const { albedoMap, bumpMap, oceanMap, lightsMap, cloudsMap } =
      this.earthMappings;

    const earthMaterial = new THREE.MeshStandardMaterial({
      map: albedoMap,
      bumpMap: bumpMap,
      bumpScale: 0.03,
      roughnessMap: oceanMap,
      roughness: 0.8,
      metalness: params.metalness,
      metalnessMap: oceanMap,
      emissiveMap: lightsMap,
      emissive: new THREE.Color(0xffff88),
      emissiveIntensity: 1,
    });

    // Create Earth mesh
    const earthGeometry = new THREE.SphereGeometry(
      this.radius,
      this.segments,
      this.segments
    );
    this.earth = new THREE.Mesh(earthGeometry, earthMaterial);

    earthMaterial.onBeforeCompile = function (shader) {
      // Add uniforms without modifying existing ones
      shader.uniforms.tClouds = { value: cloudsMap };
      shader.uniforms.tClouds.value.wrapS = THREE.RepeatWrapping;
      shader.uniforms.uv_xOffset = { value: 0 };

      // Modify the fragment shader only - we'll use existing vNormal
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <common>",
        `
        #include <common>
        uniform sampler2D tClouds;
        uniform float uv_xOffset;
        `
      );

      // Replace emissive calculation while using existing variables
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <emissivemap_fragment>",
        `
        #ifdef USE_EMISSIVEMAP
          vec4 emissiveColor = texture2D(emissiveMap, vEmissiveMapUv);
          
          // Use the existing normal and light direction
          vec3 lightDir = normalize(directionalLights[0].direction);
          float lightFactor = dot(normalize(vNormal), lightDir);
          
          // Calculate day/night factor
          float nightFactor = 1.0 - smoothstep(-0.15, 0.15, lightFactor);
          
          // Apply night lights only on the dark side
          emissiveColor *= nightFactor;
          
          totalEmissiveRadiance *= emissiveColor.rgb;
        #endif
        `
      );

      earthMaterial.userData.shader = shader;
    };
    this.earth.rotateY(-0.3);
  }

  private createCloudsLayer() {
    const { cloudsMap } = this.earthMappings;
    // Create clouds layer
    const cloudsGeometry = new THREE.SphereGeometry(
      this.radius + 0.05,
      this.segments,
      this.segments
    );
    const cloudsMaterial = new THREE.MeshStandardMaterial({
      alphaMap: cloudsMap,
      transparent: true,
    });
    this.clouds = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
    this.clouds.rotateY(-0.3);
  }

  private createAtmosphereGlow() {
    const atmosphereGeometry = new THREE.SphereGeometry(
      this.radius + 2.5,
      this.segments,
      this.segments
    );
    const atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        atmOpacity: params.atmOpacity,
        atmPowFactor: params.atmPowFactor,
        atmMultiplier: params.atmMultiplier,
      },
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
    });
    this.atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
  }

  private createEarthGroup() {
    this.earthGroup = new THREE.Group();
    this.earthGroup.add(this.earth);
    this.earthGroup.add(this.clouds);
    this.earthGroup.add(this.atmosphere);
    // earth's axial tilt is 23.5 degrees
    this.earthGroup.rotation.z = (23.5 / 360) * 2 * Math.PI;
  }

  // Animation function
  animateEarth(deltaTime: number) {
    // Rotate Earth
    this.earth.rotation.y += 0.03 * deltaTime;
    // Rotate clouds slightly faster than Earth
    this.clouds.rotation.y += 0.035 * deltaTime;
  }

  // Function to add Earth to scene
  addEarthToScene(scene: THREE.Scene) {
    scene.add(this.earthGroup);
  }
}
