'use strict';
/* ============================================================================
   渲染层：只读状态、只管画。LOOKS 按 look.draw 字段挑绘制函数。
   不改任何游戏状态；KO 弹层属于 main.js，这里只画画布上的大字。
   ============================================================================ */
const cv = document.getElementById('cv'), ctx = cv.getContext('2d');

let dpr = 1;
function fit(){
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = cv.clientWidth || W;
  cv.width = Math.round(w * dpr); cv.height = Math.round(w * dpr * H / W);
}
addEventListener('resize', fit);

/* ---------- 实体外观库：look.draw 字段挑一个 ---------- */
const LOOKS = {
  chicken(en, t){
    const w = Math.sin(t*18 + en.seed*2)*2;
    ctx.save(); ctx.translate(en.x, en.y + w);
    const d = en.vx >= 0 ? 1 : -1;
    ctx.fillStyle = 'rgba(0,0,0,.12)'; ctx.beginPath(); ctx.ellipse(0, 10, 8, 3, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, 9, 0, 7); ctx.fill();
    ctx.fillStyle = '#e8453c'; ctx.beginPath(); ctx.arc(-d*1, -9, 3, 0, 7); ctx.fill();
    ctx.fillStyle = '#ffac12'; ctx.beginPath();
    ctx.moveTo(d*8, -1); ctx.lineTo(d*14, 1); ctx.lineTo(d*8, 4); ctx.fill();
    ctx.fillStyle = '#333'; ctx.beginPath(); ctx.arc(d*4, -3, 1.6, 0, 7); ctx.fill();
    ctx.restore();
  },
  banana(en, t){
    ctx.save(); ctx.translate(en.x, en.y);
    ctx.fillStyle = 'rgba(0,0,0,.12)'; ctx.beginPath(); ctx.ellipse(0, 8, 14, 4, 0, 0, 7); ctx.fill();
    const blink = en.armed ? 1 : (Math.sin(t*20) > 0 ? .55 : 1);
    ctx.globalAlpha = blink; ctx.rotate(-.3);
    ctx.strokeStyle = '#f5c518'; ctx.lineWidth = 9; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(0, -6, 13, .35*Math.PI, .78*Math.PI); ctx.stroke();
    ctx.strokeStyle = '#fae27a'; ctx.lineWidth = 3.5;
    ctx.beginPath(); ctx.arc(0, -6, 13, .42*Math.PI, .7*Math.PI); ctx.stroke();
    ctx.restore(); ctx.globalAlpha = 1;
  },
  fireball(en){
    const c = en.look.color || '#ff6a2a';
    ctx.save(); ctx.translate(en.x, en.y);
    const g = ctx.createRadialGradient(0, 0, 1, 0, 0, en.r*1.5);
    g.addColorStop(0, '#fff3c0'); g.addColorStop(.45, c); g.addColorStop(1, 'rgba(255,80,20,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, en.r*1.5, 0, 7); ctx.fill();
    ctx.restore();
  },
  cloud(en, t){
    if (en.boltT > 0){ // 放电后 0.16s 内：一道每帧抖动的锯齿闪电，先晕后芯
      const x0 = en.x, y0 = en.y + 12, segs = 5;
      const pts = [[x0, y0]];
      for (let i = 1; i <= segs; i++){
        const f = i/segs, jit = i < segs ? (Math.random()-.5)*26 : 0;
        pts.push([x0 + (en.boltX - x0)*f + jit, y0 + (en.boltY - y0)*f]);
      }
      ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      for (const [w, c] of [[8,'rgba(159,243,255,.5)'], [3.5,'#fff8b0']]){
        ctx.lineWidth = w; ctx.strokeStyle = c;
        ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
        ctx.stroke();
      }
      ctx.restore();
    }
    ctx.save(); ctx.translate(en.x, en.y + Math.sin(t*3 + en.seed)*3);
    ctx.fillStyle = en.boltT > 0 ? '#c3cadb' : '#6f7585';
    for (const [ox, oy, r] of [[-16, 3, 12], [0, -5, 16], [16, 3, 12], [0, 6, 14]]){
      ctx.beginPath(); ctx.arc(ox, oy, r, 0, 7); ctx.fill();
    }
    ctx.fillStyle = '#2d2418'; // 凶凶的小眼睛
    for (const ex of [-7, 7]){ ctx.beginPath(); ctx.arc(ex, -2, 2.2, 0, 7); ctx.fill(); }
    ctx.restore();
  },
  none(){},
};

function drawPlayer(p, t){
  ctx.save(); ctx.translate(p.x, p.y);
  ctx.fillStyle = 'rgba(0,0,0,.14)'; ctx.beginPath(); ctx.ellipse(0, p.r*.92, p.r*.85, p.r*.26, 0, 0, 7); ctx.fill();
  if (p.dead) ctx.rotate(p.spin); else if (p.stun > 0) ctx.rotate(Math.sin(p.spin)*.5);
  const squash = 1 + Math.sin(t*5)*.025;
  ctx.scale(squash, 2 - squash);
  ctx.fillStyle = p.color;
  ctx.beginPath(); ctx.arc(0, 0, p.r, 0, 7); ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = p.dark; ctx.stroke();
  if (p.flash > 0){ ctx.fillStyle = `rgba(255,255,255,${p.flash*5})`; ctx.beginPath(); ctx.arc(0, 0, p.r, 0, 7); ctx.fill(); }
  const d = p.facing, s = p.r/26;
  ctx.fillStyle = '#2d2418';
  if (p.dead){
    ctx.lineWidth = 3*s; ctx.strokeStyle = '#2d2418';
    for (const ex of [-8*s, 8*s]){ ctx.beginPath(); ctx.moveTo(ex-3*s,-6*s); ctx.lineTo(ex+3*s,0); ctx.moveTo(ex+3*s,-6*s); ctx.lineTo(ex-3*s,0); ctx.stroke(); }
  } else if (p.blink < 0 || p.wince > 0){
    ctx.lineWidth = 2.5*s; ctx.strokeStyle = '#2d2418';
    for (const ex of [-8*s, 8*s]){ ctx.beginPath(); ctx.moveTo(ex-3*s,-3*s); ctx.lineTo(ex+3*s,-3*s); ctx.stroke(); }
  } else {
    for (const ex of [-8*s, 8*s]){ ctx.beginPath(); ctx.arc(ex + d*2*s, -3*s, 3.2*s, 0, 7); ctx.fill(); }
  }
  ctx.strokeStyle = '#2d2418'; ctx.lineWidth = 2.5*s; ctx.lineCap = 'round';
  ctx.beginPath();
  if (p.wince > 0 || p.stun > 0) ctx.arc(0, 10*s, 4*s, Math.PI*1.1, Math.PI*1.9);
  else ctx.arc(0, 5*s, 6*s, .15*Math.PI, .85*Math.PI);
  ctx.stroke();
  if (p.mods){ ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, p.r + 6 + Math.sin(t*10)*2, 0, 7); ctx.stroke(); }
  ctx.restore();
  if (p.stun > 0){ ctx.save(); ctx.translate(p.x, p.y - p.r - 12);
    for (let i=0;i<3;i++){ const a = t*5 + i*2.1; ctx.fillStyle = '#ffd34d';
      star(Math.cos(a)*16, Math.sin(a)*5, 5); } ctx.restore(); }
}
function star(x, y, r){
  ctx.save(); ctx.translate(x, y); ctx.beginPath();
  for (let i=0;i<10;i++){ const a = i*Math.PI/5 - Math.PI/2, rr = i%2 ? r*.45 : r;
    ctx.lineTo(Math.cos(a)*rr, Math.sin(a)*rr); }
  ctx.closePath(); ctx.fill(); ctx.restore();
}
function drawHUD(){
  for (const [p, left] of [[p1, true], [p2, false]]){
    const bw = 330, x = left ? 22 : W - 22 - bw, y = 18;
    ctx.fillStyle = 'rgba(0,0,0,.18)'; rr(x, y, bw, 20, 10); ctx.fill();
    const w = bw * p.hp/100;
    ctx.fillStyle = p.hp > 35 ? '#5fd068' : '#f2574b';
    if (w > 1){ rr(left ? x : x + bw - w, y, w, 20, 10); ctx.fill(); }
    ctx.fillStyle = '#4a3a18'; ctx.font = '15px "ZCOOL KuaiLe", sans-serif';
    ctx.textAlign = left ? 'left' : 'right'; ctx.textBaseline = 'middle';
    ctx.fillText(p.name + '  ' + Math.ceil(p.hp), left ? x + 10 : x + bw - 10, y + 11);
    p.skills.forEach((s, i) => {
      const cfg = SKILLS[s.id], sx = left ? x + i*150 : x + bw - 150 - i*150, sy = y + 28;
      ctx.fillStyle = s.t > 0 ? 'rgba(0,0,0,.15)' : 'rgba(255,255,255,.75)';
      rr(sx, sy, 140, 24, 8); ctx.fill();
      if (s.t > 0){ ctx.fillStyle = 'rgba(255,255,255,.55)';
        const frac = 1 - s.t/cfg.cd; if (frac > 0){ rr(sx, sy, 140*frac, 24, 8); ctx.fill(); } }
      ctx.fillStyle = '#4a3a18'; ctx.textAlign = 'left';
      ctx.fillText(cfg.key + ' · ' + cfg.label, sx + 9, sy + 13);
    });
  }
  ctx.textAlign = 'left';
}
function rr(x, y, w, h, r){ r = Math.min(r, w/2, h/2); ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function draw(t){
  ctx.setTransform(cv.width/W, 0, 0, cv.height/H, 0, 0);
  if (shake > 0){ ctx.translate((Math.random()-.5)*shake, (Math.random()-.5)*shake); }
  ctx.fillStyle = '#f7e9c6'; ctx.fillRect(-20, -20, W+40, H+40);
  ctx.fillStyle = 'rgba(205,170,100,.16)';
  for (let gx = 0; gx < W/60; gx++) for (let gy = 0; gy < H/60; gy++)
    if ((gx+gy)%2) ctx.fillRect(gx*60, gy*60, 60, 60);
  ctx.strokeStyle = 'rgba(190,140,60,.5)'; ctx.lineWidth = 3;
  ctx.setLineDash([14, 12]); ctx.beginPath(); ctx.arc(W/2, (H+TOP)/2, 120, 0, 7); ctx.stroke(); ctx.setLineDash([]);
  ctx.strokeStyle = '#caa24e'; ctx.lineWidth = WALL;
  rr(WALL/2, WALL/2, W-WALL, H-WALL, 22); ctx.stroke();
  const order = entities.slice().sort((a,b) => (a.cfg.behavior==='trap'?-1:0) - (b.cfg.behavior==='trap'?-1:0));
  for (const en of order) LOOKS[(en.look && en.look.draw) || 'none'](en, t);
  drawPlayer(p1, t); drawPlayer(p2, t + 3);
  for (const pt of particles){
    ctx.globalAlpha = Math.max(0, pt.life/pt.max); ctx.fillStyle = pt.color;
    if (pt.kind === 'star') star(pt.x, pt.y, pt.size);
    else if (pt.kind === 'feather'){ ctx.save(); ctx.translate(pt.x, pt.y); ctx.rotate(pt.rot||0);
      ctx.beginPath(); ctx.ellipse(0, 0, pt.size, pt.size*.4, 0, 0, 7); ctx.fill(); ctx.restore(); }
    else if (pt.kind === 'confetti'){ ctx.save(); ctx.translate(pt.x, pt.y); ctx.rotate(pt.rot||0);
      ctx.fillRect(-pt.size/2, -pt.size/4, pt.size, pt.size/2); ctx.restore(); }
    else { ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.size * (pt.life/pt.max), 0, 7); ctx.fill(); }
  }
  ctx.globalAlpha = 1;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const f of floats){
    ctx.globalAlpha = Math.min(1, f.t*3); ctx.font = f.size + 'px "ZCOOL KuaiLe", sans-serif';
    ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(60,40,10,.6)'; ctx.strokeText(f.text, f.x, f.y);
    ctx.fillStyle = f.color; ctx.fillText(f.text, f.x, f.y);
  }
  ctx.globalAlpha = 1;
  if (state === 'countdown'){
    const n = Math.ceil(stateT - .4), label = n >= 1 ? n : '开打！';
    ctx.font = '86px "ZCOOL KuaiLe", sans-serif';
    ctx.lineWidth = 8; ctx.strokeStyle = 'rgba(60,40,10,.5)';
    ctx.strokeText(label, W/2, H/2 - 20);
    ctx.fillStyle = n >= 1 ? '#fff' : '#ffd34d'; ctx.fillText(label, W/2, H/2 - 20);
  }
  if (state === 'ko' && !koShown){
    ctx.font = '110px "ZCOOL KuaiLe", sans-serif';
    ctx.lineWidth = 10; ctx.strokeStyle = 'rgba(60,40,10,.6)';
    ctx.strokeText('KO！', W/2, H/2 - 10);
    ctx.fillStyle = '#ffd34d'; ctx.fillText('KO！', W/2, H/2 - 10);
  }
  drawHUD();
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
}
