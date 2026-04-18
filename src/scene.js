import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

export const scene = new THREE.Scene();

export const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;

let renderer, composer;

export function initScene(container) {
  renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true }); 
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); 
  renderer.toneMapping = THREE.ReinhardToneMapping;
  container.appendChild(renderer.domElement);

  const renderScene = new RenderPass(scene, camera);

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5, 0.4, 0.85
  );
  bloomPass.threshold = 0;
  bloomPass.strength = 1.2; 
  bloomPass.radius = 0.5;

  composer = new EffectComposer(renderer);
  composer.addPass(renderScene);
  composer.addPass(bloomPass);

  window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
}

const updatables = [];

export function addUpdatable(fn) {
  updatables.push(fn);
}

let lastTime = null;

export function animate(currentTime) {
  requestAnimationFrame(animate);
  
  if(!lastTime) lastTime = currentTime;
  const time = currentTime * 0.001;
  const dt = (currentTime - lastTime) * 0.001;
  lastTime = currentTime;

  updatables.forEach(fn => fn(time, dt));

  if (composer) {
    composer.render();
  } else if (renderer) {
    renderer.render(scene, camera);
  }
}
