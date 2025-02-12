"use strict";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { GlobeLight } from "./components/globeLight";
import { Earth } from "./components/earth";
import { ProgressBarManager } from "./utils/progressBarManager";
import WebGL from "three/addons/capabilities/WebGL.js";

const MESSAGING_API_ENDPOINT = import.meta.env.VITE_MESSAGING_API_ENDPOINT;

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
    this.addSmoothScrolling();
    this.addModalControls();
    this.addFormControls();
    this.addScrollTopControls();
    if (WebGL.isWebGL2Available()) {
      this.render3dScene();
    } else {
      const loadingScreen = document.querySelector(
        ".loading-screen"
      ) as HTMLDivElement;
      loadingScreen.classList.add("hidden");
      const homeScreen = document.querySelector("section#home") as HTMLElement;
      homeScreen.classList.add("with-background");
    }
  }
  addScrollTopControls() {
    const btnScrollTop = document.querySelector(
      "button.btn-scroll-top"
    ) as HTMLButtonElement;
    if (btnScrollTop) {
      window.onscroll = () => {
        if (
          document.body.scrollTop > 100 ||
          document.documentElement.scrollTop > 100
        ) {
          btnScrollTop.classList.remove("hidden");
        } else {
          btnScrollTop.classList.add("hidden");
        }
      };

      btnScrollTop.addEventListener("click", (event) => {
        event.preventDefault();
        document
          .querySelector(`section#home`)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }
  addFormControls() {
    const form = document.querySelector(
      "form.contact-me-form"
    ) as HTMLFormElement;
    const submitBtn = document.querySelector(
      ".btn-submit"
    ) as HTMLButtonElement;

    const nameInput = document.querySelector(
      "input#name-input"
    ) as HTMLInputElement;
    const emailInput = document.querySelector(
      "input#email-input"
    ) as HTMLInputElement;
    const messageInput = document.querySelector(
      "textarea#message-input"
    ) as HTMLTextAreaElement;

    const inputFields = [nameInput, emailInput, messageInput];

    inputFields.forEach((input) => {
      input.addEventListener("change", () => {
        input.classList.remove("error-input");
      });
    });

    if (form && submitBtn) {
      submitBtn.addEventListener("click", (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        const name = formData.get("name")?.toString();
        const email = formData.get("email")?.toString();
        const telephone = formData.get("telephone")?.toString();
        const message = formData.get("message")?.toString();

        let firstErrorInput: HTMLInputElement | HTMLTextAreaElement | null =
          null;

        if (!name) {
          nameInput.classList.add("error-input");
          firstErrorInput = nameInput;
        }
        if (!email) {
          emailInput.classList.add("error-input");
          if (!firstErrorInput) firstErrorInput = emailInput;
        }
        if (!message) {
          messageInput.classList.add("error-input");
          if (!firstErrorInput) firstErrorInput = messageInput;
        }
        if (firstErrorInput) {
          this.showToast("Please fill in the required fields.", "error");
          firstErrorInput.focus();
          return;
        }
        if (MESSAGING_API_ENDPOINT) {
          fetch(MESSAGING_API_ENDPOINT, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, email, telephone, message }),
          }).then(() => {
            form.reset();
          });
        } else {
          console.error("MESSAGING_API_ENDPOINT not configured!");
        }
        this.showToast(
          "Thanks for reaching out. Looking forward to seeing you soon!",
          "success"
        );
      });
    }
  }
  addModalControls() {
    const modalButtons = [].slice.call(
      document.querySelectorAll(".modal-btn")
    ) as HTMLButtonElement[];

    modalButtons.forEach((modalButton) => {
      modalButton.addEventListener("click", (event) => {
        event.preventDefault();
        const target = modalButton.dataset.target;
        const modal = document.querySelector(
          `dialog#${target}`
        ) as HTMLDialogElement;
        if (modal) {
          modal.showModal();
          document.body.style.overflow = "hidden";
          if (!modal.onclose) {
            modal.onclose = () => {
              document.body.style.overflow = "auto";
            };
          }
        }
      });
    });
  }
  async render3dScene() {
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

    this.earth = new Earth(10, 32);
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

  showToast(message: string, type: "success" | "error", timeout = 3000) {
    const toast = document.querySelector(".toast");
    if (toast) {
      const toastContent = toast.querySelector(
        ".toast-content"
      ) as HTMLDivElement;
      toastContent.innerHTML = message;
      toast.classList.add("show", type);
      setTimeout(() => {
        requestAnimationFrame(() => {
          toast.classList.remove("show");
          toast.classList.remove(type);
        });
      }, timeout);
    }
  }
}

new Main();
