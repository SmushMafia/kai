# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 运行

无构建、无依赖、无测试框架：浏览器直接打开 `index.html` 即可（file:// 可用）。改完代码刷新页面验证。

普通 `<script>` 全局变量串联，**不是 ES 模块**。加载顺序写死在 index.html 底部：`skills.js → characters.js → fx.js → engine.js → render.js → main.js`，后面的文件直接用前面的全局名（`SKILLS`、`CHARACTERS`、`W`、`puff` 等）。

## 项目定位

本地双人同键盘对战游戏的最简框架，目标用户是初中生（口述点子、AI 改配置）。改动要保持这个定位：**优先加配置，不加抽象**；文档和注释精简、机制为主、不自创 flavor。

## 架构：配置 ↔ 引擎分离

两类文件，职责严格分开：

**配置文件（孩子/AI 改的）**
- `characters.js` — `CHARACTERS` 数组：名字/颜色/键位/技能列表/出生点。标题、图例、主题色全部由 main.js 从这里生成，页面无硬编码。
- `skills.js` — `SKILLS` 对象：每个技能 = 一个配置对象，三层参数化：`spawn`（生成什么：数量/位置/初速）× `entity`（怎么动：`behavior` 字段 + `hit` 打击参数）× `look`（长什么样：`draw` 函数名 + 颜色）。

**引擎文件（框架层）**
- `engine.js` — 状态 + 规则，不碰 DOM。核心是两个注册表式入口：`cast()` 是所有技能的唯一施放路径；`BEHAVIORS` 是行为库（seek/projectile/trap/aura/zone），`entity.behavior` 按名挑选。命中统一走 `hitCheck()`/`damage()`，屏震/闪白/击退/漂浮字由引擎层免费送。
- `render.js` — 只读状态只管画。`LOOKS` 是外观库（chicken/banana/fireball/cloud/none），`look.draw` 按名挑选。
- `fx.js` — 粒子/漂浮字/屏震，不认识玩家和技能，引擎和渲染都调它。
- `main.js` — 装配：从配置生成标题/图例/CSS 变量、键盘输入、KO 弹层、requestAnimationFrame 主循环。

**扩展路径**：新技能 = 在 SKILLS 加对象（零代码）；现有 behavior/draw 不够用时，才在 engine.js 的 BEHAVIORS 或 render.js 的 LOOKS 加一个函数，然后配置里按名引用。

## 需要知道的约定

- 键位两套写法：`CHARACTERS.keys` 写键码（`KeyW`/`ArrowUp`），`SKILLS.key` 写标注（`'Q'`/`'.'`），换算函数 `skillKeyCode()`/`keyLabelOf()` 在 engine.js 顶部。
- 场地常量在 engine.js：`W=960, H=560, WALL, TOP`（TOP 下方才是可活动区，上方是 HUD）。手感参数集中在 `TUNING`。
- 观赏兜底原则：点子不拒绝，量级悄悄截断——`ENTITY_CAP`（engine.js）和 `PARTICLE_CAP`（fx.js）。新玩法照此办理，别弹错误。
- `prefers-reduced-motion` 已接入（fx.js 的 `REDUCED`）：屏震/慢动作/彩带数量都按它降级，新特效也要照顾。
- 深浅色主题用 CSS 变量（index.html），画布内世界是固定的"阳光竞技场"配色，不随主题变。
