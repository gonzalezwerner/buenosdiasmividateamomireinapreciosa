import * as THREE from 'three';
import { scene, camera } from './scene.js';
import gsap from 'gsap';

let galaxyParticles;
let originalPositions; 
let heartPositions; 
let namePositions;

let shootingStars = [];

const wordsList = [
  "Mi Vida", "Luz de mis ojos", "Mi Amor", "Preciosa", 
  "Dueña de mí", "Estrella fugaz", "Sonrisa perfecta", "Mi Universo"
];
const wordElements = [];
const wordPositions = [];
let wordContainer;

export function initPhase2() {
  const count = 4000;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  originalPositions = new Float32Array(count * 3);
  heartPositions = new Float32Array(count * 3);
  namePositions = new Float32Array(count * 3);

  const colorPalette = [
    new THREE.Color('#ff9a9e'),
    new THREE.Color('#fecfef'),
    new THREE.Color('#a18cd1'),
    new THREE.Color('#fbc2eb')
  ];

  generateNamePositions(namePositions, count);

  for(let i=0; i<count; i++) {
    const r = 20 + Math.random() * 80;
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.acos(Math.random() * 2 - 1);
    
    let x = r * Math.sin(phi) * Math.cos(theta);
    let y = r * Math.sin(phi) * Math.sin(theta);
    let z = r * Math.cos(phi) - 60; 

    positions[i*3] = x;
    positions[i*3+1] = y;
    positions[i*3+2] = z;
    
    originalPositions[i*3] = x;
    originalPositions[i*3+1] = y;
    originalPositions[i*3+2] = z;

    const t = Math.random() * Math.PI * 2;
    const scale = 0.9; // Scale down to fit mobile portrait width
    const heartX = 16 * Math.pow(Math.sin(t), 3) * scale;
    const heartY = (13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t)) * scale;
    
    const noiseX = (Math.random()-0.5)*2;
    const noiseY = (Math.random()-0.5)*2;
    const noiseZ = (Math.random()-0.5)*6;

    heartPositions[i*3] = heartX + noiseX;
    heartPositions[i*3+1] = heartY + noiseY + (6 * scale); // Desplazar hacia arriba para centrar en Y
    heartPositions[i*3+2] = -100 + noiseZ;  // Push much further back away from camera (-35)

    const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
    colors[i*3] = color.r;
    colors[i*3+1] = color.g;
    colors[i*3+2] = color.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.18,
    vertexColors: true,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  galaxyParticles = new THREE.Points(geometry, material);
  scene.add(galaxyParticles);

  for(let i=0; i<8; i++) {
    createShootingStar();
  }

  wordContainer = document.createElement('div');
  wordContainer.id = 'words-container';
  document.getElementById('ui-layer').appendChild(wordContainer);

  wordsList.forEach((text) => {
    let el = document.createElement('div');
    el.className = 'floating-word';
    el.innerText = text;
    wordContainer.appendChild(el);
    wordElements.push(el);

    let wx = (Math.random() - 0.5) * 50;
    let wy = (Math.random() - 0.5) * 30;
    let wz = -40 - (Math.random() * 80); 
    wordPositions.push(new THREE.Vector3(wx, wy, wz));
  });
}

function generateNamePositions(array, count) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  canvas.width = 1000;
  canvas.height = 300;

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = 'bold 150px "Great Vibes", cursive, serif';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Geraldine', canvas.width/2, canvas.height/2);

  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  const validPixels = [];
  
  for(let y=0; y<canvas.height; y+=2) {
    for(let x=0; x<canvas.width; x+=2) {
      const idx = (y * canvas.width + x) * 4;
      if(imgData[idx] > 100) {
        validPixels.push({x, y});
      }
    }
  }

  for(let i=0; i<count; i++) {
    if(validPixels.length > 0) {
      const p = validPixels[Math.floor(Math.random() * validPixels.length)];
      // map to 3d world coordinates but scale down for strict mobile portrait width
      array[i*3] = (p.x - canvas.width/2) * 0.045; 
      array[i*3+1] = -(p.y - canvas.height/2) * 0.045; 
      array[i*3+2] = -100 + (Math.random()-0.5)*15; // Mayor esparcimiento en Z para que no se difumine (Unreal Bloom)
    } else {
      array[i*3] = 0; array[i*3+1] = 0; array[i*3+2] = -100;
    }
  }
}

function createShootingStar() {
  const geo = new THREE.CylinderGeometry(0, 0.05, 5, 4);
  geo.rotateX(Math.PI / 2);
  const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
  const mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);
  
  mesh.position.set((Math.random() - 0.5) * 150, (Math.random() - 0.5) * 150, -100);
  
  shootingStars.push({
    mesh: mesh,
    speed: 2 + Math.random() * 2,
    active: false
  });
}

export function startPhase2() {
  gsap.to(galaxyParticles.material, { opacity: 0.9, duration: 2 });
  gsap.to(camera.position, { z: -35, duration: 15, ease: "power1.inOut" });

  shootingStars.forEach(star => {
    setTimeout(() => { star.active = true; }, Math.random() * 8000);
  });
  
  wordContainer.style.opacity = '1';
}

export function updatePhase2(time, touchX, touchY, dt = 0.016) {
  if (!galaxyParticles) return;
  
  if(galaxyParticles.state === 'heart') {
    galaxyParticles.rotation.y = time * 0.1;
    const scale = 1 + Math.sin(time * 5) * 0.05;
    galaxyParticles.scale.set(scale, scale, scale);
  } else if (galaxyParticles.state === 'name') {
    // Subtle float
    galaxyParticles.rotation.y = Math.sin(time * 0.5) * 0.1;
    galaxyParticles.rotation.x = Math.cos(time * 0.5) * 0.05;
  } else {
    galaxyParticles.rotation.y = time * 0.02;
  }

  camera.position.x += (touchX * 8 - camera.position.x) * 0.05;
  camera.position.y += (-touchY * 8 - camera.position.y) * 0.05;

  wordElements.forEach((el, index) => {
    wordPositions[index].z += 10 * dt; 
    
    if(wordPositions[index].z > camera.position.z + 5) {
      wordPositions[index].z = camera.position.z - 80 - Math.random() * 40;
      wordPositions[index].x = (Math.random() - 0.5) * 50;
      wordPositions[index].y = (Math.random() - 0.5) * 30;
    }

    const pos3D = wordPositions[index].clone();
    pos3D.project(camera);
    
    if (pos3D.z > 1) {
      el.style.opacity = '0';
      return;
    }

    const x = (pos3D.x *  .5 + .5) * window.innerWidth;
    const y = (pos3D.y * -.5 + .5) * window.innerHeight;
    
    const distance = camera.position.distanceTo(wordPositions[index]);
    
    let op = 0;
    if(distance > 5 && distance < 60) {
      op = Math.sin((distance - 5) / 55 * Math.PI); 
    }
    el.style.opacity = op * 0.9;
    
    let scale = Math.max(0.2, 20 / distance); 
    if(scale > 4) scale = 4;

    el.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${scale})`;
  });

  shootingStars.forEach(star => {
    if(!star.active) return;
    star.mesh.position.z += star.speed;
    star.mesh.position.x -= star.mesh.position.x * 0.01;
    star.mesh.position.y -= star.mesh.position.y * 0.01;

    if(star.mesh.position.z > camera.position.z + 10) {
      star.mesh.position.set((Math.random() - 0.5) * 150, (Math.random() - 0.5) * 150, -100);
      star.active = false;
      setTimeout(() => { star.active = true; }, Math.random() * 3000 + 1000);
    }
  });
}

export function formHeartConstellation(onComplete) {
  let proxy = { val: 0 };
  const positions = galaxyParticles.geometry.attributes.position.array;
  
  gsap.to(galaxyParticles.rotation, {x:0, y:0, z:0, duration: 2.5, ease: "power2.out"});
  
  gsap.to(proxy, {
    val: 1,
    duration: 3.5,
    ease: "power3.inOut",
    onUpdate: () => {
      const p = proxy.val;
      for(let i=0; i<positions.length; i++) {
         positions[i] = originalPositions[i] + (heartPositions[i] - originalPositions[i]) * p;
      }
      galaxyParticles.geometry.attributes.position.needsUpdate = true;
    },
    onComplete: () => {
      galaxyParticles.state = 'heart';
      if(onComplete) setTimeout(onComplete, 6000); // 6 seconds looking at the heart
    }
  });

  wordContainer.style.opacity = '0';
  document.querySelectorAll('.floating-word').forEach(e => e.style.opacity = '0');
  shootingStars.forEach(s => { s.mesh.visible = false; s.active = false; });
}

export function formNameConstellation(onComplete) {
  let proxy = { val: 0 };
  const positions = galaxyParticles.geometry.attributes.position.array;
  
  // Save current (heart) positions as starting point for this morph
  const startPositions = new Float32Array(positions);
  
  galaxyParticles.state = 'transition';
  gsap.to(galaxyParticles.scale, {x:1, y:1, z:1, duration: 1}); // Reset heart pulse
  gsap.to(galaxyParticles.rotation, {x:0, y:0, z:0, duration: 2});

  gsap.to(proxy, {
    val: 1,
    duration: 4,
    ease: "power2.inOut",
    onUpdate: () => {
      const p = proxy.val;
      for(let i=0; i<positions.length; i++) {
         positions[i] = startPositions[i] + (namePositions[i] - startPositions[i]) * p;
      }
      galaxyParticles.geometry.attributes.position.needsUpdate = true;
    },
    onComplete: () => {
      galaxyParticles.state = 'name';
      if(onComplete) setTimeout(onComplete, 8000); // 8 seconds looking at her name
    }
  });
}

export function endPhase2(onComplete) {
  gsap.to(galaxyParticles.material, { opacity: 0, duration: 2, onComplete: () => {
    scene.remove(galaxyParticles);
    shootingStars.forEach(s => scene.remove(s.mesh));
    if(wordContainer.parentNode) wordContainer.parentNode.removeChild(wordContainer);
    if(onComplete) onComplete();
  }});
  gsap.to(camera.position, { z: -80, duration: 2, ease: "power2.in" }); 
}
