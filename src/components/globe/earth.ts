import * as THREE from "three";
import vertexShader from "../../shaders/vertex.glsl";
import fragmentShader from "../../shaders/fragment.glsl";

interface IEarthMappings {
  albedoMap: THREE.Texture;
  bumpMap: THREE.Texture;
  cloudsMap: THREE.Texture;
  oceanMap: THREE.Texture;
  lightsMap: THREE.Texture;
}

const TEXTURE_DIR = "/assets/textures/";

const params = {
  metalness: 0.1,
  atmOpacity: { value: 0.7 },
  atmPowFactor: { value: 4.1 },
  atmMultiplier: { value: 9.5 },
};

/**
 * The Earth, its cloud layer and atmosphere, in one group. The group's
 * local frame is the geographic frame used by `toEarthVector`: no spin,
 * no axial tilt (the sun's declination already accounts for the season).
 */
export class Earth {
  private radius: number;
  private segments: number;
  private earth!: THREE.Mesh;
  private clouds!: THREE.Mesh;
  private atmosphere!: THREE.Mesh;
  private earthGroup!: THREE.Group;
  private earthMappings!: IEarthMappings;

  constructor(radius: number, segments: number, manager: THREE.LoadingManager) {
    this.radius = radius;
    this.segments = segments;
    this.loadEarthTextures(manager);
    this.createEarthMesh();
    this.createCloudsLayer();
    this.createAtmosphereGlow();
    this.createEarthGroup();
  }

  private loadEarthTextures(manager: THREE.LoadingManager) {
    const loader = new THREE.TextureLoader(manager);
    const load = (file: string) => loader.load(TEXTURE_DIR + file);

    this.earthMappings = {
      albedoMap: load("Albedo.jpg"),
      bumpMap: load("Bump.jpg"),
      cloudsMap: load("Clouds.png"),
      oceanMap: load("Ocean.png"),
      lightsMap: load("night_lights_modified.png"),
    };

    this.earthMappings.albedoMap.colorSpace = THREE.SRGBColorSpace;
  }

  private createEarthMesh() {
    const { albedoMap, bumpMap, oceanMap, lightsMap } = this.earthMappings;

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

    const earthGeometry = new THREE.SphereGeometry(
      this.radius,
      this.segments,
      this.segments,
    );
    this.earth = new THREE.Mesh(earthGeometry, earthMaterial);

    // Night lights: show the emissive map only on the side facing away from
    // the sun. directionalLights[0] must be the sun (see GlobeLight).
    earthMaterial.onBeforeCompile = function (shader) {
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <emissivemap_fragment>",
        `
        #ifdef USE_EMISSIVEMAP
          vec4 emissiveColor = texture2D(emissiveMap, vEmissiveMapUv);

          vec3 lightDir = normalize(directionalLights[0].direction);
          float lightFactor = dot(normalize(vNormal), lightDir);

          float nightFactor = 1.0 - smoothstep(-0.15, 0.15, lightFactor);

          emissiveColor *= nightFactor;

          totalEmissiveRadiance *= emissiveColor.rgb;
        #endif
        `,
      );
    };
  }

  private createCloudsLayer() {
    const cloudsGeometry = new THREE.SphereGeometry(
      this.radius + 0.05,
      this.segments,
      this.segments,
    );
    const cloudsMaterial = new THREE.MeshStandardMaterial({
      alphaMap: this.earthMappings.cloudsMap,
      transparent: true,
    });
    this.clouds = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
  }

  private createAtmosphereGlow() {
    const atmosphereGeometry = new THREE.SphereGeometry(
      this.radius + 2.5,
      this.segments,
      this.segments,
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
  }

  getGroup(): THREE.Group {
    return this.earthGroup;
  }

  dispose() {
    for (const mesh of [this.earth, this.clouds, this.atmosphere]) {
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    }
    for (const texture of Object.values(this.earthMappings)) {
      texture.dispose();
    }
  }
}
