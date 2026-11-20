/* ============================================================================
   页面装配：标题 / 图例从配置生成（键位、名字、颜色只有 characters.js +
   skills.js 一份），键盘输入、KO 弹层、主循环都在这里。
   这是 ES 模块（要引 render.js）；配置和引擎是普通 script，全局变量直接用。
   ============================================================================ */
import { fit, draw } from './render.js';
const koBox = document.getElementById('koBox'), koWho = document.getElementById('koWho'), again = document.getElementById('again');

/* ---------- 标题 + 主题色 ---------- */
document.documentElement.style.setProperty('--p1', CHARACTERS[0].color);
document.documentElement.style.setProperty('--p2', CHARACTERS[1].color);
{
  const h1 = document.getElementById('title');
  const t1 = document.createElement('span'); t1.className = 'c1'; t1.textContent = CHARACTERS[0].name;
  const vs = document.createElement('span'); vs.className = 'vs'; vs.textContent = 'VS';
  const t2 = document.createElement('span'); t2.className = 'c2'; t2.textContent = CHARACTERS[1].name;
  h1.replaceChildren(t1, vs, t2);
}

/* ---------- 键位图例：从 CHARACTERS + SKILLS 生成 ---------- */
function legendRow(keyLabels, what){
  const row = document.createElement('div'); row.className = 'row';
  for (const k of keyLabels){ const kbd = document.createElement('kbd'); kbd.textContent = k; row.append(kbd); }
  const span = document.createElement('span'); span.className = 'what'; span.textContent = what; row.append(span);
  return row;
}
{
  const legend = document.getElementById('legend');
  CHARACTERS.forEach((c, i) => {
    const side = document.createElement('div'); side.className = 'side'; side.dataset.p = i + 1;
    const h2 = document.createElement('h2');
    const dot = document.createElement('span'); dot.className = 'dot';
    h2.append(dot, c.name + (c.spawnX < W/2 ? '（左边出生）' : '（右边出生）'));
    side.append(h2);
    side.append(legendRow(['up','left','down','right'].map(k => keyLabelOf(c.keys[k])), '移动'));
    for (const id of c.skills){ const s = SKILLS[id]; side.append(legendRow([s.key], s.label + ' ' + s.desc)); }
    legend.append(side);
  });
}

/* ---------- 输入 ---------- */
const keys = window.keys = {}; // engine.js 读这个全局
const USED = new Set();
for (const c of CHARACTERS){
  Object.values(c.keys).forEach(k => USED.add(k));
  c.skills.forEach(id => USED.add(skillKeyCode(SKILLS[id].key)));
}
addEventListener('keydown', e => {
  if (USED.has(e.code)) { e.preventDefault(); if (!e.repeat) keyPressed(e.code); keys[e.code] = true; }
});
addEventListener('keyup', e => { if (USED.has(e.code)) { e.preventDefault(); keys[e.code] = false; } });

/* ---------- KO 弹层 + 主循环 ---------- */
again.addEventListener('click', () => { reset(); koBox.hidden = true; });
let last = 0;
function loop(ms){
  const t = ms/1000, dt = Math.min(.033, t - last || .016); last = t;
  update(dt);
  if (state === 'ko' && !koShown && stateT <= -(REDUCED ? .15 : .95)){
    koShown = true;
    koWho.textContent = winner.name + ' 获胜！🏆';
    koBox.hidden = false; again.focus();
  }
  draw(t);
  requestAnimationFrame(loop);
}
fit(); reset(); requestAnimationFrame(loop);
