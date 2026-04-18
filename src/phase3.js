import * as THREE from 'three';
import { scene, camera } from './scene.js';
import gsap from 'gsap';

let ambientLight, sunLight;
let floor;
let petalParticles;

export function initPhase3() {
  ambientLight = new THREE.AmbientLight(0xffa95c, 0); 
  scene.add(ambientLight);

  sunLight = new THREE.DirectionalLight(0xffd700, 0);
  sunLight.position.set(0, -10, -50); 
  scene.add(sunLight);

  const floorGeo = new THREE.PlaneGeometry(200, 200);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x1a0f1a,
    roughness: 0.1,
    metalness: 0.5,
    transparent: true,
    opacity: 0
  });
  floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -5;
  scene.add(floor);

  // Floating petals
  const count = 500;
  const pGeo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  for(let i=0; i<count; i++) {
    pos[i*3] = (Math.random() - 0.5) * 50;
    pos[i*3+1] = Math.random() * 20 - 5;
    pos[i*3+2] = (Math.random() - 0.5) * 50 - 20;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pMat = new THREE.PointsMaterial({
    size: 0.2,
    color: 0xffb6c1,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending
  });
  petalParticles = new THREE.Points(pGeo, pMat);
  scene.add(petalParticles);
}

export function startPhase3(onComplete) {
  // Move camera back to center
  gsap.to(camera.position, { x: 0, y: 0, z: 10, duration: 5, ease: "power2.inOut" });
  
  gsap.to(ambientLight, { intensity: 0.8, duration: 6 });
  
  gsap.to(sunLight.position, { y: 20, duration: 8, ease: "power1.out" });
  gsap.to(sunLight, { intensity: 2, duration: 6 });
  
  gsap.to(floor.material, { opacity: 1, duration: 4 });
  gsap.to(petalParticles.material, { opacity: 0.6, duration: 4 });

  // Dawn background
  const bg = {r: 0, g: 0, b: 0};
  gsap.to(bg, {
    r: 0.15, g: 0.05, b: 0.08, 
    duration: 6,
    onUpdate: () => {
      scene.background = new THREE.Color(bg.r, bg.g, bg.b);
    },
    onComplete: () => {
      if(onComplete) onComplete();
    }
  });
}

// Global animation for petals
export function updatePhase3(time) {
  if (petalParticles && petalParticles.material.opacity > 0) {
    const pos = petalParticles.geometry.attributes.position.array;
    for(let i=0; i<pos.length; i+=3) {
      pos[i+1] -= 0.02; // fall down gently
      pos[i] += Math.sin(time + i) * 0.01; // sway
      if(pos[i+1] < -5) pos[i+1] = 15; // reset
    }
    petalParticles.geometry.attributes.position.needsUpdate = true;
  }
}
