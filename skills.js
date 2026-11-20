'use strict';
/* ============================================================================
   技能配置：孩子 / AI 改技能只碰这个文件。
   技能 = 配置对象，三层全参数化：
     spawn    生成什么（数量 / 位置 / 初速）
     entity   怎么动（behavior）+ 碰到人怎样（hit）
     look     长什么样（draw 函数名 + 颜色 / 大小）
   新技能 = 在 SKILLS 里加一个对象。引擎层免费送：屏震、闪白、击退、粒子。
   behavior 可选值见 engine.js 的 BEHAVIORS；draw 可选值见 render.js 的 LOOKS。
   look.image 可选（素材占位）：透明底 PNG 路径，写了就画图片，不写用 draw 函数。
   hit.stop 可选：命中定格秒数，不写按伤害自动算。
   key 是按键（字母直接写，如 'Q'；符号写 '.' '/' 等）；desc 显示在键位图例里。
   ============================================================================ */
const SKILLS = {
  chickens: { // 召唤类
    label:'召唤十只鸡', key:'Q', cd:4.5, desc:'🐔 一拥而上追着啄',
    spawn:{ count:10, at:'ring', ringR:46 },
    entity:{ behavior:'seek', speed:150, accel:420, life:6, r:9, damage:4,
      hit:{ knockback:170, shake:4, burst:'feather', pop:'啄！' } },
    look:{ draw:'chicken' },
    shout:'鸡鸡们，上！'
  },
  banana: { // 陷阱类
    label:'香蕉皮', key:'E', cd:2.5, desc:'🍌 丢在身后，踩到就滑倒',
    spawn:{ count:1, at:'behind', dist:34 },
    entity:{ behavior:'trap', armDelay:.35, life:12, r:15, damage:6,
      hit:{ knockback:60, shake:6, burst:'star', pop:'滑倒啦！', stun:1.3, slide:260 } },
    look:{ draw:'banana' },
    shout:'小心脚下～'
  },
  fireball: { // 弹体类
    label:'分裂火球', key:'.', cd:1.7, desc:'🔥 炸开变三个小火球',
    spawn:{ count:1, at:'muzzle', dist:30, aim:'enemy', speed:330 },
    entity:{ behavior:'projectile', life:2.6, r:13, damage:10, trail:'#ff8a3d',
      split:{ after:.5, count:3, fanDeg:46,
        child:{ behavior:'projectile', speed:300, life:1.6, r:8, damage:6, trail:'#ffb13d',
          hit:{ knockback:200, shake:5, burst:'ember', pop:'烫烫烫！' },
          look:{ draw:'fireball', color:'#ffb13d' } } },
      hit:{ knockback:260, shake:7, burst:'ember', pop:'轰！' } },
    look:{ draw:'fireball', color:'#ff6a2a' },
    shout:'火球，开花！'
  },
  stormcloud: { // 区域类
    label:'放电乌云', key:',', cd:7, desc:'⛈️ 飘到对手头顶连环放电',
    spawn:{ count:1, at:'self' },
    entity:{ behavior:'zone', life:5, damage:5,
      zone:{ hover:90, follow:2.2, every:.9, zapR:110 },
      hit:{ knockback:150, shake:5, burst:'spark', pop:'滋滋！' } },
    look:{ draw:'cloud' },
    shout:'乌云，去！'
  },
  giant: { // 变身类
    label:'巨人变身', key:'/', cd:8, desc:'💪 变大好几倍，撞人贼疼',
    spawn:{ count:1, at:'self' },
    entity:{ behavior:'aura', duration:4.2,
      mods:{ scale:2.15, speed:1.12, contactDamage:12, contactKnockback:420, stompShake:9 },
      hit:{ knockback:420, shake:10, burst:'star', pop:'咚！！' } },
    look:{ draw:'none' },
    shout:'我！变！大！'
  },
};
