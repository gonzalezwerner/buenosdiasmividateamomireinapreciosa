import * as THREE from 'three';
import { scene, camera } from './scene.js';
import gsap from 'gsap';

let fireflyMesh;

export function initPhase4() {
  const count = 300;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  
  for(let i=0; i<count; i++) {
    // Generate them scattered globally
    positions[i*3] = (Math.random() - 0.5) * 30;
    positions[i*3+1] = (Math.random() - 0.5) * 30;
    positions[i*3+2] = (Math.random() - 0.5) * 10 - 2; // close to final phase 3/4 camera
  }
  
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  
  const material = new THREE.PointsMaterial({
    size: 0.1,
    color: 0xffdf88, 
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending
  });
  
  fireflyMesh = new THREE.Points(geometry, material);
  scene.add(fireflyMesh);
}

export function startPhase4() {
  // Fireflies activate
  gsap.to(fireflyMesh.material, { opacity: 1, duration: 4 });
  
  const letterP = document.querySelector('.letter-text');
  
  // HTML Message with line breaks. 
  const finalHtml = `Hola, mi amor. Buenos días, mi reina hermosa, preciosa.<br><br>` +
  `Solo quería desearte un día increíble, lleno de bendiciones, y recordarte lo feliz que me haces. De verdad, gracias por cada minuto, cada hora y cada segundo a tu lado… no sabes cuánto valoro todo eso.<br><br>` +
  `Te lo juro, eres lo más bonito que me ha pasado. Quién diría que gracias a un live iba a encontrar a alguien tan maravillosa como tú. Eres una mujer increíble, de esas que no se encuentran todos los días, y sinceramente siento que sin ti no soy nada… porque te has vuelto todo lo que quiero y todo lo que siempre voy a querer.<br><br>` +
  `Nadie, pero nadie te iguala, porque eres única, hermosa y auténtica. Mi pasatiempo favorito es estar contigo, compartir contigo… porque desde que llegaste, mis días simplemente son mejores.<br><br>` +
  `Gracias también por permitirme conocer un poco más a tu hijo Roberto. No sabes cuánto significa eso para mí, lo mucho que lo aprecio y lo feliz que me hace.<br><br>` +
  `Y quiero que tengas algo muy claro: no pienso fallarte. Contigo siento que lo tengo todo. A veces quizá me quedo callado, pero no es a propósito… me encanta hablar contigo, solo que a veces me cuesta expresarme y puedo parecer un poco cortante. Pero poco a poco voy a mejorar, y quiero que seas parte de ese proceso, que conozcas la mejor versión de mí, una versión renovada… también gracias a ti.<br><br>` +
  `<b>Porque te amo, mi amor.<br>Te amo, mi reina, mi princesa hermosa… eres el amor de mi vida.</b>`;
  
  letterP.innerHTML = "";
  
  setTimeout(() => {
    typeWriter(letterP, finalHtml, 0);
  }, 2500); // give the UI box time to expand in CSS
}

function typeWriter(element, htmlString, i) {
  if (i <= htmlString.length) {
    element.innerHTML = htmlString.slice(0, i) + '<span class="cursor">|</span>';
    
    let nextChar = htmlString.charAt(i);
    let jump = 1;
    if (nextChar === '<') {
      const endTag = htmlString.indexOf('>', i);
      if (endTag !== -1) jump = (endTag - i) + 1; // skip whole HTML tags instantly
    }
    
    // typing speed varies, but fast because it's a long text
    const speed = nextChar === '<' ? 0 : (5 + Math.random() * 20);

    setTimeout(() => {
      typeWriter(element, htmlString, i + jump);
    }, speed);
  } else {
    // Done typing
    element.innerHTML = htmlString; 
    gsap.to(document.getElementById('reply-btn'), { opacity: 1, y: 0, duration: 2, ease: 'power3.out' });
  }
}

export function updatePhase4(time, touchX, touchY, dt) {
  if (fireflyMesh && fireflyMesh.material.opacity > 0) {
    fireflyMesh.rotation.y = time * 0.05;
    fireflyMesh.rotation.x = time * 0.02;
    
    // Float lazily around cursor
    fireflyMesh.position.x += (touchX * 3 - fireflyMesh.position.x) * 0.02;
    fireflyMesh.position.y += (-touchY * 3 - fireflyMesh.position.y) * 0.02;
  }
}
