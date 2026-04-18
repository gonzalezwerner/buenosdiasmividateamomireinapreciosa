import './style.css';
import { initScene, animate, addUpdatable, camera } from './scene.js';
import { initPhase1, updatePhase1, explodePhase1 } from './phase1.js';
import { initPhase2, updatePhase2, startPhase2, formHeartConstellation, formNameConstellation, endPhase2 } from './phase2.js';
import { initPhase3, startPhase3, updatePhase3 } from './phase3.js';
import { initPhase4, startPhase4, updatePhase4 } from './phase4.js';

let currentPhase = 1;
let touchX = 0;
let touchY = 0;

const ui1 = document.getElementById('phase1-ui');
const ui2 = document.getElementById('phase2-ui');
const ui3 = document.getElementById('phase3-ui');
const ui4 = document.getElementById('phase4-ui');
const startBtn = document.getElementById('start-btn');

function init() {
  const container = document.getElementById('canvas-container');
  initScene(container);

  initPhase1();
  initPhase2();
  initPhase3();
  initPhase4();

  window.addEventListener('touchstart', onTouchMove, {passive: false});
  window.addEventListener('touchmove', onTouchMove, {passive: false});
  window.addEventListener('mousemove', (e) => {
    touchX = (e.clientX / window.innerWidth) - 0.5;
    touchY = (e.clientY / window.innerHeight) - 0.5;
  });

  addUpdatable((time, dt) => {
    if (currentPhase === 1) updatePhase1(time);
    if (currentPhase === 2) updatePhase2(time, touchX, touchY, dt);
    if (currentPhase >= 3) updatePhase3(time);
    if (currentPhase === 4) updatePhase4(time, touchX, touchY, dt);
  });

  startBtn.addEventListener('click', triggerPhase1Explosion);
  
  animate(performance.now());
}

function onTouchMove(e) {
  if(e.touches && e.touches.length > 0) {
    touchX = (e.touches[0].clientX / window.innerWidth) - 0.5;
    touchY = (e.touches[0].clientY / window.innerHeight) - 0.5;
  }
}

function triggerPhase1Explosion() {
  ui1.classList.remove('active');
  startBtn.style.pointerEvents = 'none';

  explodePhase1(() => {
    currentPhase = 2;
    ui2.classList.add('active');
    startPhase2();
    
    // Increased time to enjoy space before heart forms
    setTimeout(() => {
      ui2.classList.remove('active');
      
      formHeartConstellation(() => {
        // After heart, form name 'Geraldine'
        formNameConstellation(() => {
          
          endPhase2(() => {
            currentPhase = 3;
            ui3.classList.add('active');
            startPhase3(() => {
              setTimeout(() => {
                ui3.classList.remove('active');
                ui4.classList.add('active');
                currentPhase = 4;
                startPhase4(); 
              }, 6000);
            });
          });
          
        });
      });
    }, 15000); // 15 seconds watching shooting stars
  });
}

const replyBtn = document.getElementById('reply-btn');
replyBtn.addEventListener('click', () => {
  window.open('https://wa.me/?text=Buenos%20d%C3%ADas%20mi%20amor%20%E2%9D%A4%EF%B8%8F%20Acabo%20de%20ver%20tu%20sorpresa%20y%20me%20dejaste%20sin%20palabras!', '_blank');
});

window.onload = init;
