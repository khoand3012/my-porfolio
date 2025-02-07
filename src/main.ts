import "./style.css";
import * as THREE from "three";
import { Font, FontLoader, OrbitControls } from "three/examples/jsm/Addons.js";
import GlobeLight from "./components/globeLight";
import Earth from "./components/earth";
import Star from "./components/star";
import FloatingText from "./components/floatingText";

const NUM_OF_STARS = 200;

class Main {
  scene!: THREE.Scene;
  camera!: THREE.PerspectiveCamera;
  renderer!: THREE.WebGLRenderer;
  controls!: OrbitControls;
  clock!: THREE.Clock;
  titleText!: THREE.Mesh;
  subtitleText!: THREE.Mesh;
  earth!: Earth;
  constructor() {
    this.init();
  }
  async init() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: document.querySelector("#bg") as HTMLCanvasElement,
    });

    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.position.setZ(30);

    const globeLight = new GlobeLight(
      new THREE.DirectionalLight(0xffffff, 3),
      [5, 3, 4.5],
      new THREE.AmbientLight(0x404040, 0.8)
    );
    globeLight.addLightToScene(this.scene);
    this.earth = new Earth(
      {
        map: "assets/textures/earth_atmos_2048.jpg",
        normalMap: "assets/textures/earth_normal_2048.jpg",
        specularMap: "assets/textures/earth_specular_2048.jpg",
        cloudsMap: "assets/textures/earth_clouds_2048.jpg",
      },
      7,
      64
    );
    this.earth.addEarthToScene(this.scene);

    const font = await this.loadFont("assets/fonts/Futury_Light_Regular.json");

    const floatingTitle = new FloatingText("Hi there!", font);
    floatingTitle.addFloatingTextToScene(
      this.scene,
      new THREE.Vector3(0, 15, 0)
    );
    const floatingSubtitle = new FloatingText(
      "My name is Khoa, and welcome to my world!",
      font
    );
    floatingSubtitle.addFloatingTextToScene(
      this.scene,
      new THREE.Vector3(0, 11, 0)
    );

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableZoom = false;

    for (let i = 0; i < NUM_OF_STARS; i++) {
      const star = new Star();
      star.addStarToScene(this.scene);
    }

    this.clock = new THREE.Clock();

    this.animate();

    window.addEventListener("resize", () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    });
  }

  async loadFont(src: string): Promise<Font> {
    return new Promise((resolve, reject) => {
      const loader = new FontLoader();
      loader.load(
        src,
        (font) => {
          resolve(font);
        },
        (event) => {
          console.log("Loading font...", event);
        },
        (err) => {
          console.error("An error occurred when loading the font:", err);
          reject(err);
        }
      );
    });
  }

  animate() {
    if (!this.clock) {
      this.clock = new THREE.Clock();
    }

    const deltaTime = this.clock.getDelta();
    this.earth.animateEarth(deltaTime);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.animate.bind(this));
  }
}

new Main();
