import * as THREE from 'three';
import { scene } from './scene.js';
import gsap from 'gsap';

let centerLight, centerMaterial, centerMesh;
let particlesMesh, particlesGeometry;

export function initPhase1() {
  // Center heartbeat light
  centerLight = new THREE.PointLight(0xffffff, 2, 10);
  scene.add(centerLight);

  const geometry = new THREE.SphereGeometry(0.15, 16, 16);
  centerMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  centerMesh = new THREE.Mesh(geometry, centerMaterial);
  scene.add(centerMesh);

  // Create idle particles
  const count = 3000;
  particlesGeometry = new THREE.BufferGeometry();
  const posArray = new Float32Array(count * 3);
  for(let i = 0; i < count * 3; i++) {
    // start near center
    posArray[i] = (Math.random() - 0.5) * 1.0;
  }
  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
  
  const pMaterial = new THREE.PointsMaterial({
    size: 0.03,
    color: 0x88ccff,
    transparent: true,
    opacity: 0, 
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  
  particlesMesh = new THREE.Points(particlesGeometry, pMaterial);
  scene.add(particlesMesh);
}

export function updatePhase1(time) {
  if (centerMesh) {
    const scale = 1 + Math.sin(time * 4) * 0.2; // Fast heartbeat
    centerMesh.scale.set(scale, scale, scale);
    centerLight.intensity = Math.max(0, Math.sin(time * 4)) * 2 + 1;
  }
  if (particlesMesh) {
    particlesMesh.rotation.y = time * 0.1;
  }
}

export function explodePhase1(onComplete) {
  // En vez de hacer la bola 0 instántaneamente, la haremos crecer a tamaño supernova por 4 segundos
  gsap.to(centerMesh.scale, { x: 40, y: 40, z: 40, duration: 4, ease: "power2.in" });
  centerMaterial.transparent = true;
  gsap.to(centerMaterial, { opacity: 0, duration: 4, ease: "power2.in" });
  
  // Aumentar la luz de forma bestial
  gsap.to(centerLight, { intensity: 30, distance: 200, duration: 4, yoyo: true, repeat: 1 });
  
  gsap.to(particlesMesh.material, { opacity: 1, duration: 2 });
  
  const positions = particlesGeometry.attributes.position.array;
  
  // Supernova expansion
  const targets = [];
  for(let i=0; i<positions.length; i+=3) {
    let x = positions[i] || (Math.random() - 0.5);
    let y = positions[i+1] || (Math.random() - 0.5);
    let z = positions[i+2] || (Math.random() - 0.5);
    
    // Normalize to expand outwards
    const length = Math.sqrt(x*x + y*y + z*z) || 0.1;
    let factor = (15 + Math.random() * 20) / length;
    
    targets.push(x * factor, y * factor, z * factor);
  }

  // Animate array positions manually with a surrogate object for GSAP
  let proxy = { val: 0 };
  gsap.to(proxy, {
    val: 1,
    duration: 6,
    ease: "power3.out",
    onUpdate: () => {
      const p = proxy.val;
      for(let i=0; i<positions.length; i+=3) {
        positions[i] += (targets[i/3*3] - positions[i]) * 0.05 * p;
        positions[i+1] += (targets[i/3*3+1] - positions[i+1]) * 0.05 * p;
        positions[i+2] += (targets[i/3*3+2] - positions[i+2]) * 0.05 * p;
      }
      particlesGeometry.attributes.position.needsUpdate = true;
    }
  });

  setTimeout(() => {
    scene.remove(centerMesh);
    scene.remove(particlesMesh);
    if(onComplete) onComplete();
  }, 7000);
}
