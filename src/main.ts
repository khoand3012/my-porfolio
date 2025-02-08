import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import GlobeLight from "./components/globeLight";
import Earth from "./components/earth";
import ProgressBarManager from "./utils/progressBarManager";

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
    this.initialScroll();
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
      new THREE.DirectionalLight(0xffffff, 1.3),
      [-100, 0, 50],
      new THREE.AmbientLight(0x404040, 0.8)
    );
    globeLight.addLightToScene(this.scene);

    const progressBarManager = ProgressBarManager.getInstance();
    const textureLoader = new THREE.TextureLoader();

    const envMap = textureLoader.load(
      "assets/textures/Gaia_EDR3_darkened.png",
      () => {
        progressBarManager.updateProgress(10, "Loading background map...");
      }
    );
    envMap.mapping = THREE.EquirectangularReflectionMapping;
    this.scene.background = envMap;

    this.earth = new Earth(10, 64);
    this.earth.addEarthToScene(this.scene);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableZoom = false;

    this.clock = new THREE.Clock();

    this.animate();

    window.addEventListener("resize", () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    });

    this.addSmoothScrolling();
  }
  addSmoothScrolling() {
    const anchors = [].slice.call(
      document.querySelectorAll('a[href^="#"]')
    ) as HTMLAnchorElement[];
    anchors.forEach((anchor) => {
      const href = anchor.getAttribute("href");
      if (href) {
        anchor.addEventListener("click", (event) => {
          event.preventDefault();
          document
            .querySelector(`section${href}`)
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
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

  initialScroll() {
    document.body.style.overflow = "hidden";
  }
}

new Main();
