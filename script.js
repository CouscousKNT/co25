import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
// import { LuminosityHighPassShader } from "three/addons/postprocessing/LuminosityHighPassShader.js";
// import { CopyShader } from "three/addons/postprocessing/CopyShader.js";

const lenis = new Lenis({
  // lerp: 0.04,
});
let lenisEnabled = false;

lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => {
  if (lenisEnabled) {
    lenis.raf(time * 1000);
  }
});
gsap.ticker.lagSmoothing(0);

const hdrEquirect = new RGBELoader().load(
  "assets/empty_warehouse_01_4k.hdr",
  () => {
    hdrEquirect.mapping = THREE.EquirectangularReflectionMapping;
  }
);

const options = {
  enableSwoopingCamera: false,
  enableRotation: true,
  transmission: 1,
  thickness: 1.2,
  roughness: 0.6,
  envMapIntensity: 1.5,
  clearcoat: 1,
  clearcoatRoughness: 0.1,
  normalScale: 1,
  clearcoatNormalScale: 0.3,
  normalRepeat: 1,
  bloomThreshold: 0.85,
  bloomStrength: 0.5,
  bloomRadius: 0.33,
};

const material = new THREE.MeshPhysicalMaterial({
  transmission: options.transmission,
  thickness: options.thickness,
  roughness: options.roughness,
  envMap: hdrEquirect,
  envMapIntensity: options.envMapIntensity,
  clearcoat: options.clearcoat,
  clearcoatRoughness: options.clearcoatRoughness,
  normalScale: new THREE.Vector2(options.normalScale),
  clearcoatNormalScale: new THREE.Vector2(options.clearcoatNormalScale),
});

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
});
renderer.setClearColor(0x1f1e1c, 0);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.physicallyCorrectLights = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 2.5;
document.querySelector(".model").appendChild(renderer.domElement);
console.log(document.querySelector(".model"));

const renderPass = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  options.bloomStrength,
  options.bloomRadius,
  options.bloomThreshold
);

const composer = new EffectComposer(renderer);
composer.addPass(renderPass);
composer.addPass(bloomPass);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
scene.add(ambientLight);

const mainLight = new THREE.DirectionalLight(0xffffff, 7.5);
mainLight.position.set(0.5, 7.5, 2.5);
scene.add(mainLight);

const fillLight = new THREE.DirectionalLight(0xffffff, 2.5);
fillLight.position.set(-15, 0, -5);
scene.add(fillLight);

const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1.5);
hemiLight.position.set(0, 0, 0);
scene.add(hemiLight);

function basicAnimate() {
  renderer.render(scene, camera);
  requestAnimationFrame(basicAnimate);
}
basicAnimate();

let model;
const loader = new GLTFLoader();
loader.load("./assets/logo.glb", function (gltf) {
  model = gltf.scene;
  const logo = gltf.scene.children.find((mesh) => mesh.name === "Curve");
  const geometry = logo.geometry.clone();
  const mesh = new THREE.Mesh(geometry, material);

  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  model.position.sub(center);
  scene.add(model);

  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  camera.position.z = maxDim * 1.75;

  model.scale.set(0, 0, 0);
  model.rotation.set(0, 0.5, 0);
  playInitialAnimation();

  cancelAnimationFrame(basicAnimate);
  animate();
});

const floatAmplitude = 0.2;
const floatSpeed = 1.5;
const rotationSpeed = 0.3;
let isFloating = true;
let currentScroll = 0;

const totalScrollHeight =
  document.documentElement.scrollHeight - window.innerHeight;
console.log(totalScrollHeight);

function playInitialAnimation() {
  if (model) {
    gsap.to(model.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: 1,
      ease: "power2.out",
    });
  }
}

lenis.on("scroll", (e) => {
  currentScroll = e.scroll;
});

function animate() {
  if (model) {
    if (isFloating) {
      const floatOffset =
        Math.sin(Date.now() * 0.001 * floatSpeed) * floatAmplitude;
      model.position.y = floatOffset;
    }

    const scrollProgress = Math.min(currentScroll / totalScrollHeight, 1);

    const baseTilt = 0.5;
    model.rotation.x = scrollProgress * Math.PI * 4 + baseTilt;
  }

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

const splitText = new SplitType(".outro-copy h2", {
  types: "lines",
  lineClass: "line",
});

splitText.lines.forEach((line) => {
  const text = line.innerHTML;
  line.innerHTML = `<span style="display: block; transform: translateY(70px);">${text}</span>`;
});

ScrollTrigger.create({
  trigger: ".outro",
  start: "top center",
  onEnter: () => {
    gsap.to(".outro-copy h2 .line span", {
      translateY: 0,
      duration: 1,
      stagger: 0.1,
      ease: "power3.out",
      force3D: true,
    });
  },
  onLeaveBack: () => {
    gsap.to(".outro-copy h2 .line span", {
      translateY: 70,
      duration: 1,
      stagger: 0.1,
      ease: "power3.out",
      force3D: true,
    });
  },
  toggleActions: "play reverse play reverse",
});

gsap.set(".mask", { y: innerHeight });
gsap.set(".nav-item, .logo", { y: -100 });
const tl = gsap.timeline({});

tl.to(".loading", {
  backgroundColor: "#000000",
  opacity: 0,
  ease: "power1.out",
  duration: 2,
});
tl.to(".logo-loading", {
  opacity: 0,
  ease: "power1.out",
  duration: 1,
});
tl.to(".mask", {
  y: 0,
  delay: 1,
  duration: 1.5,
  ease: "power1.out",
  stagger: 0.1,
});

tl.to(".logo", {
  y: 0,
  ease: "power1.out",
});

tl.to(".nav-item", {
  y: 0,
  ease: "power1.out",
  stagger: 0.1,
});
tl.add(function () {
  console.log("caca");
  lenisEnabled = true;
});
