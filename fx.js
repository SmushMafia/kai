'use strict';
/* ============================================================================
   特效层：粒子 / 漂浮字 / 屏震。引擎和渲染都调它，它不认识玩家和技能。
   观赏兜底：粒子设上限，点子不拒绝，量级悄悄截断。
   ============================================================================ */
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const PARTICLE_CAP = 300;

let particles = [], floats = [], shake = 0;

function resetFx(){ particles = []; floats = []; shake = 0; }

function addP(p){ if (particles.length < PARTICLE_CAP) particles.push(p); }
function puff(x, y, color, n){ for (let i=0;i<n;i++) addP({x,y,vx:(Math.random()-.5)*60,vy:(Math.random()-.5)*60,life:.4,max:.4,size:3+Math.random()*3,color,g:0,kind:'dot'}); }
function boom(x, y, color, n){ for (let i=0;i<n;i++){ const a=Math.random()*Math.PI*2,v=60+Math.random()*180; addP({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:.5,max:.5,size:3+Math.random()*4,color,g:160,kind:'dot'}); } }
function burst(x, y, kind, n){
  const defs = { feather:{c:'#fff',k:'feather',g:40}, star:{c:'#ffd34d',k:'star',g:60}, ember:{c:'#ff7a2a',k:'dot',g:120}, spark:{c:'#9ff3ff',k:'star',g:50} };
  const d = defs[kind] || defs.star;
  for (let i=0;i<n;i++){ const a=Math.random()*Math.PI*2,v=50+Math.random()*160;
    addP({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-40,life:.6+Math.random()*.3,max:.9,size:4+Math.random()*4,color:d.c,g:d.g,kind:d.k,rot:Math.random()*6}); }
}
function confetti(w){ const c=['#ff6a6a','#ffd34d','#6adf7e','#6ab8ff','#c98bff'][Math.random()*5|0];
  addP({x:Math.random()*w,y:-10,vx:(Math.random()-.5)*80,vy:60+Math.random()*120,life:1.6,max:1.6,size:5+Math.random()*4,color:c,g:60,kind:'confetti',rot:Math.random()*6}); }
function popText(x, y, text, color, size){ floats.push({x,y,text,color,size,t:.9}); if (floats.length > 24) floats.shift(); }
function bump(mag){ if (!REDUCED) shake = Math.min(14, shake + mag); }

function updateFx(dt){
  for (const pt of particles){ pt.life -= dt; pt.x += pt.vx*dt; pt.y += pt.vy*dt; pt.vy += (pt.g||0)*dt; if (pt.rot != null) pt.rot += dt*4; }
  particles = particles.filter(p => p.life > 0);
  for (const f of floats){ f.t -= dt; f.y -= 34*dt; }
  floats = floats.filter(f => f.t > 0);
  shake = Math.max(0, shake - dt*26);
}
