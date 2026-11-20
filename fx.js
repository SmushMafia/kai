'use strict';
/* ============================================================================
   特效层：只记录「发生了什么特效」，不管怎么画。
   引擎调 burst / boom / ring / puff / smoke / scorch / confetti，事件排进 fxQueue，
   render.js 每帧取走交给 three.quarks 放粒子。漂浮字、屏震、闪白是状态，渲染层直接读。
   观赏兜底：队列和漂浮字都设上限，点子不拒绝，量级悄悄截断。
   ============================================================================ */
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const FX_QUEUE_CAP = 120;

let fxQueue = [], floats = [], shake = 0, shakeDir = null, flashA = 0, fxEpoch = 0;

function resetFx(){ fxQueue = []; floats = []; shake = 0; shakeDir = null; flashA = 0; fxEpoch++; }
function emitFx(e){ if (fxQueue.length < FX_QUEUE_CAP) fxQueue.push(e); }
function takeFx(){ const q = fxQueue; fxQueue = []; return q; }

const rnd = (a, b) => a + Math.random()*(b - a);

function puff(x, y, color, n){ emitFx({ type:'puff', x, y, color, n }); }     // 一团烟尘
function ring(x, y, color, size){ emitFx({ type:'ring', x, y, color, size }); } // 地面冲击波圈
function smoke(x, y, n){ emitFx({ type:'smoke', x, y, n }); }
function scorch(x, y, r){ emitFx({ type:'scorch', x, y, r }); }                 // 地面焦痕
function boom(x, y, color, n){ emitFx({ type:'boom', x, y, color, n }); }      // 爆炸：火光 + 火花 + 烟 + 冲击波 + 焦痕
function burst(x, y, kind, n){ emitFx({ type:'burst', x, y, kind, n }); }      // 命中：kind 对应 hit.burst（star / feather / ember / spark）
function confetti(n){ emitFx({ type:'confetti', n }); }
function popText(x, y, text, color, size, sub){ floats.push({x,y,text,color,size,sub,t:.9,max:.9}); if (floats.length > 24) floats.shift(); }

/* 屏震：给了方向（dx, dy 单位向量）就沿受击方向晃，没给就随机抖 */
function bump(mag, dx, dy){ if (REDUCED) return; shake = Math.min(14, shake + mag); shakeDir = dx == null ? null : {x:dx, y:dy}; }
function flash(a){ if (!REDUCED) flashA = Math.max(flashA, a); }

/* frozen：命中定格期间漂浮字不动，只让屏震和闪白继续衰减 */
function updateFx(dt, frozen){
  if (!frozen){
    for (const f of floats){ f.t -= dt; f.y -= 34*dt; }
    floats = floats.filter(f => f.t > 0);
  }
  shake = Math.max(0, shake - dt*26);
  flashA = Math.max(0, flashA - dt*3);
}
