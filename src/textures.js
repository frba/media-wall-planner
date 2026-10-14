/* Arch2D — WS3: procedural Canvas 2D textures (project.md §3.7). No SVG, no external
   images, so export via toDataURL() can never be tainted. Deterministic per element id. */
(function () {
  'use strict';
  const A = window.Arch2D;
  const U = A.util;

  const cache = new Map(); // LRU of pre-rendered static textures
  const CACHE_MAX = 96;

  /* ---------- helpers ---------- */
  function seeded(el, salt) {
    return U.rng(U.hashString(el.id + '|' + (salt || '')));
  }
  function doorSplits(ctx, w, h, s, color) {
    const doorCm = 60;
    if (w / s < 90 || h / s < 30) return;
    const n = Math.max(2, Math.round(w / s / doorCm));
    ctx.save();
    for (let i = 1; i < n; i++) {
      const x = Math.round((w / n) * i) + 0.5;
      ctx.strokeStyle = U.rgba(U.shade(color, -0.55), 0.55);
      ctx.lineWidth = Math.max(1, 0.25 * s);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
      ctx.strokeStyle = U.rgba('#ffffff', 0.12);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + 1, 0);
      ctx.lineTo(x + 1, h);
      ctx.stroke();
    }
    ctx.restore();
  }
  function edgeShading(ctx, w, h, s) {
    // top highlight + bottom shadow lip gives every box a sense of depth
    const lip = Math.max(1, Math.min(h * 0.12, 1.2 * s));
    let g = ctx.createLinearGradient(0, 0, 0, lip * 2);
    g.addColorStop(0, 'rgba(255,255,255,0.16)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, lip * 2);
    g = ctx.createLinearGradient(0, h - lip * 2, 0, h);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,0.22)');
    ctx.fillStyle = g;
    ctx.fillRect(0, h - lip * 2, w, lip * 2);
  }
  function noise(ctx, w, h, rand, density, alpha) {
    const count = Math.min(2200, Math.floor(w * h * density));
    for (let i = 0; i < count; i++) {
      ctx.fillStyle = rand() < 0.5 ? `rgba(0,0,0,${alpha})` : `rgba(255,255,255,${alpha})`;
      ctx.fillRect(rand() * w, rand() * h, 1, 1);
    }
  }

  /* ---------- texture painters: draw into (0,0,w,h) ---------- */
  const painters = {
    slats(ctx, el, w, h, s) {
      const c = el.color;
      const rand = seeded(el, 'slats');
      ctx.fillStyle = U.shade(c, -0.55); // shadow gaps
      ctx.fillRect(0, 0, w, h);
      let slat = 3 * s;
      let gap = 1.2 * s;
      const minPitch = 4; // px — keep slats readable when zoomed out
      if (slat + gap < minPitch) {
        const k = minPitch / (slat + gap);
        slat *= k;
        gap *= k;
      }
      const pitch = slat + gap;
      const count = Math.ceil(w / pitch);
      const offset = (w - count * pitch + gap) / 2;
      for (let i = 0; i < count; i++) {
        const x = offset + i * pitch;
        const tone = U.shade(c, (rand() - 0.5) * 0.1);
        const g = ctx.createLinearGradient(x, 0, x + slat, 0);
        g.addColorStop(0, U.shade(tone, 0.18));
        g.addColorStop(0.35, tone);
        g.addColorStop(1, U.shade(tone, -0.28));
        ctx.fillStyle = g;
        ctx.fillRect(x, 0, slat, h);
        // subtle vertical grain
        if (slat > 5) {
          ctx.strokeStyle = U.rgba(U.shade(tone, -0.4), 0.12);
          ctx.lineWidth = 0.6;
          for (let k = 0; k < 2; k++) {
            const gx = x + slat * (0.2 + rand() * 0.6);
            ctx.beginPath();
            ctx.moveTo(gx, 0);
            ctx.bezierCurveTo(gx + rand() * 2 - 1, h * 0.33, gx + rand() * 2 - 1, h * 0.66, gx, h);
            ctx.stroke();
          }
        }
      }
      // floor/ceiling shadow falloff
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, 'rgba(0,0,0,0.12)');
      g.addColorStop(0.15, 'rgba(0,0,0,0)');
      g.addColorStop(0.9, 'rgba(0,0,0,0)');
      g.addColorStop(1, 'rgba(0,0,0,0.16)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    },

    woodgrain(ctx, el, w, h, s) {
      const c = el.color;
      const rand = seeded(el, 'grain');
      const base = ctx.createLinearGradient(0, 0, w, h);
      base.addColorStop(0, U.shade(c, 0.06));
      base.addColorStop(1, U.shade(c, -0.06));
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, w, h);
      const spacing = Math.max(2.5, 1.1 * s);
      const lines = Math.ceil(h / spacing) + 2;
      ctx.lineWidth = Math.max(0.6, 0.12 * s);
      for (let i = 0; i < lines; i++) {
        const y0 = i * spacing + (rand() - 0.5) * spacing;
        const amp = (0.3 + rand() * 0.9) * spacing;
        const freq = (0.6 + rand() * 1.4) * (Math.PI * 2) / Math.max(w, 1);
        const phase = rand() * Math.PI * 2;
        ctx.strokeStyle = U.rgba(U.shade(c, -0.45), 0.08 + rand() * 0.14);
        ctx.beginPath();
        for (let x = 0; x <= w; x += Math.max(4, w / 60)) {
          const y = y0 + Math.sin(x * freq + phase) * amp;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      // cathedral arches / knots
      const knots = Math.min(6, Math.floor((w * h) / (90 * s * 40 * s)) + 1);
      for (let k = 0; k < knots; k++) {
        const cx = rand() * w;
        const cy = rand() * h;
        const rx = (8 + rand() * 14) * s;
        const ry = (1.2 + rand() * 2) * s;
        for (let r = 1; r <= 4; r++) {
          ctx.strokeStyle = U.rgba(U.shade(c, -0.5), 0.07);
          ctx.beginPath();
          ctx.ellipse(cx, cy, rx * (r / 4), ry * (r / 4), 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      doorSplits(ctx, w, h, s, c);
      // recessed handle groove along the top
      if (h / s >= 25 && w / s >= 60) {
        const gy = Math.max(2, 2.5 * s);
        ctx.fillStyle = U.rgba(U.shade(c, -0.7), 0.55);
        ctx.fillRect(0, gy, w, Math.max(1, 0.6 * s));
      }
      edgeShading(ctx, w, h, s);
    },

    matte(ctx, el, w, h, s) {
      const c = el.color;
      const rand = seeded(el, 'matte');
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, U.shade(c, 0.05));
      g.addColorStop(1, U.shade(c, -0.05));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      noise(ctx, w, h, rand, 0.12, 0.035);
      doorSplits(ctx, w, h, s, c);
      edgeShading(ctx, w, h, s);
    },

    glass(ctx, el, w, h, s) {
      const c = el.color;
      const bezel = Math.max(1.5, 0.7 * s);
      ctx.fillStyle = U.shade(c, -0.35);
      ctx.fillRect(0, 0, w, h);
      const ix = bezel, iy = bezel, iw = w - bezel * 2, ih = h - bezel * 2;
      const g = ctx.createLinearGradient(0, iy, 0, iy + ih);
      g.addColorStop(0, U.shade(c, 0.1));
      g.addColorStop(1, U.shade(c, -0.1));
      ctx.fillStyle = g;
      ctx.fillRect(ix, iy, iw, ih);
      // soft inner glow (panel backlight)
      const rg = ctx.createRadialGradient(ix + iw * 0.3, iy + ih * 0.25, 0, ix + iw * 0.3, iy + ih * 0.25, Math.max(iw, ih) * 0.9);
      rg.addColorStop(0, 'rgba(120,150,190,0.16)');
      rg.addColorStop(1, 'rgba(120,150,190,0)');
      ctx.fillStyle = rg;
      ctx.fillRect(ix, iy, iw, ih);
      // diagonal sheen band
      ctx.save();
      ctx.beginPath();
      ctx.rect(ix, iy, iw, ih);
      ctx.clip();
      const sheen = ctx.createLinearGradient(ix, iy, ix + iw, iy + ih);
      sheen.addColorStop(0.0, 'rgba(255,255,255,0)');
      sheen.addColorStop(0.28, 'rgba(255,255,255,0.10)');
      sheen.addColorStop(0.36, 'rgba(255,255,255,0.02)');
      sheen.addColorStop(0.5, 'rgba(255,255,255,0)');
      ctx.fillStyle = sheen;
      ctx.fillRect(ix, iy, iw, ih);
      ctx.restore();
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 1;
      ctx.strokeRect(ix + 0.5, iy + 0.5, iw - 1, ih - 1);
    },

    mesh(ctx, el, w, h, s) {
      const c = el.color;
      ctx.fillStyle = c;
      ctx.fillRect(0, 0, w, h);
      const pitch = Math.max(3, 0.7 * s);
      const tile = document.createElement('canvas');
      const tp = Math.max(2, Math.round(pitch));
      tile.width = tile.height = tp;
      const t = tile.getContext('2d');
      t.fillStyle = U.rgba(U.shade(c, 0.35), 0.5);
      t.beginPath();
      t.arc(tp / 2, tp / 2, Math.max(0.5, tp * 0.2), 0, Math.PI * 2);
      t.fill();
      t.fillStyle = U.rgba(U.shade(c, -0.5), 0.35);
      t.fillRect(0, 0, tp, Math.max(0.5, tp * 0.12));
      ctx.fillStyle = ctx.createPattern(tile, 'repeat');
      ctx.fillRect(0, 0, w, h);
      edgeShading(ctx, w, h, s);
      // rounded end caps feel
      const g = ctx.createLinearGradient(0, 0, w, 0);
      g.addColorStop(0, 'rgba(0,0,0,0.25)');
      g.addColorStop(0.04, 'rgba(0,0,0,0)');
      g.addColorStop(0.96, 'rgba(0,0,0,0)');
      g.addColorStop(1, 'rgba(0,0,0,0.25)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    },

    niche(ctx, el, w, h, s) {
      const c = el.color;
      const rand = seeded(el, 'niche');
      const frame = Math.max(2, 2 * s);
      ctx.fillStyle = U.shade(c, 0.04);
      ctx.fillRect(0, 0, w, h);
      const ix = frame, iy = frame, iw = Math.max(0, w - frame * 2), ih = Math.max(0, h - frame * 2);
      // recess with inset shadow
      ctx.fillStyle = U.shade(c, -0.22);
      ctx.fillRect(ix, iy, iw, ih);
      let g = ctx.createLinearGradient(0, iy, 0, iy + Math.min(ih, 12 * s));
      g.addColorStop(0, 'rgba(0,0,0,0.35)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(ix, iy, iw, Math.min(ih, 12 * s));
      g = ctx.createLinearGradient(ix, 0, ix + Math.min(iw, 6 * s), 0);
      g.addColorStop(0, 'rgba(0,0,0,0.22)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(ix, iy, Math.min(iw, 6 * s), ih);

      // shelves every ~35cm with objects
      const shelfCm = 35;
      const nShelves = Math.max(0, Math.floor(ih / s / shelfCm) - 1);
      const levels = [];
      for (let i = 1; i <= nShelves; i++) levels.push(iy + (ih / (nShelves + 1)) * i);
      levels.push(iy + ih); // base
      const thick = Math.max(1.5, 2.5 * s);
      const palette = ['#7d6b5d', '#a79584', '#5d6a72', '#b9a88f', '#8b5e4a', '#3f4a52', '#d8cfc0'];
      let prev = iy;
      for (const ly of levels) {
        const bay = ly - prev - thick;
        if (bay / s >= 22 && iw / s >= 20) {
          let x = ix + iw * (0.08 + rand() * 0.2);
          const end = ix + iw * (0.55 + rand() * 0.3);
          while (x < end) {
            const bw = (2 + rand() * 2.5) * s;
            const bh = Math.min(bay * 0.9, (17 + rand() * 9) * s);
            ctx.fillStyle = palette[Math.floor(rand() * palette.length)];
            const lean = rand() < 0.08;
            if (lean) {
              ctx.save();
              ctx.translate(x, ly);
              ctx.rotate(-0.25);
              ctx.fillRect(0, -bh, bw, bh);
              ctx.restore();
              x += bw * 2.2;
            } else {
              ctx.fillRect(x, ly - bh, bw, bh);
              x += bw + 0.25 * s;
            }
          }
          if (rand() < 0.65 && end + 14 * s < ix + iw) {
            // vase
            const vx = end + (5 + rand() * 6) * s;
            const vh = Math.min(bay * 0.7, (12 + rand() * 10) * s);
            const vw = vh * (0.45 + rand() * 0.2);
            ctx.fillStyle = rand() < 0.5 ? '#e9e3d8' : '#3b3633';
            ctx.beginPath();
            ctx.ellipse(vx, ly - vh / 2, vw / 2, vh / 2, 0, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        if (ly < iy + ih - 0.5) {
          ctx.fillStyle = U.shade(c, 0.12);
          ctx.fillRect(ix, ly - thick, iw, thick);
          g = ctx.createLinearGradient(0, ly, 0, ly + 4 * s);
          g.addColorStop(0, 'rgba(0,0,0,0.25)');
          g.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = g;
          ctx.fillRect(ix, ly, iw, 4 * s);
        }
        prev = ly;
      }
    },

    fireplace(ctx, el, w, h, s, time) {
      const c = el.color;
      const rand = seeded(el, 'fire');
      ctx.fillStyle = c;
      ctx.fillRect(0, 0, w, h);
      const inset = Math.max(2, 3 * s);
      const ix = inset, iy = inset, iw = Math.max(0, w - inset * 2), ih = Math.max(0, h - inset * 2);
      ctx.fillStyle = '#060504';
      ctx.fillRect(ix, iy, iw, ih);
      ctx.save();
      ctx.beginPath();
      ctx.rect(ix, iy, iw, ih);
      ctx.clip();
      // ember bed
      const bedH = Math.max(2, ih * 0.16);
      let g = ctx.createLinearGradient(0, iy + ih - bedH, 0, iy + ih);
      g.addColorStop(0, 'rgba(255,120,40,0.0)');
      g.addColorStop(0.5, 'rgba(255,110,30,0.65)');
      g.addColorStop(1, 'rgba(120,30,10,0.9)');
      ctx.fillStyle = g;
      ctx.fillRect(ix, iy + ih - bedH, iw, bedH);
      // flames
      ctx.globalCompositeOperation = 'lighter';
      const n = Math.max(4, Math.round(iw / (9 * s)));
      const t = (time || 0) / 1000;
      for (let i = 0; i < n; i++) {
        const phase = rand() * Math.PI * 2;
        const speed = 2 + rand() * 2.5;
        const fx = ix + (iw / n) * (i + 0.5) + Math.sin(t * 1.3 + phase) * (iw / n) * 0.15;
        const fh = ih * (0.45 + 0.35 * (0.5 + 0.5 * Math.sin(t * speed + phase)) + rand() * 0.1);
        const fw = (iw / n) * (0.9 + rand() * 0.6);
        const base = iy + ih - bedH * 0.4;
        const fg = ctx.createLinearGradient(0, base, 0, base - fh);
        fg.addColorStop(0, 'rgba(255,170,60,0.85)');
        fg.addColorStop(0.45, 'rgba(255,110,30,0.55)');
        fg.addColorStop(1, 'rgba(255,60,10,0)');
        ctx.fillStyle = fg;
        ctx.beginPath();
        ctx.moveTo(fx - fw / 2, base);
        ctx.quadraticCurveTo(fx - fw * 0.45, base - fh * 0.55, fx + Math.sin(t * 3 + phase) * fw * 0.15, base - fh);
        ctx.quadraticCurveTo(fx + fw * 0.45, base - fh * 0.55, fx + fw / 2, base);
        ctx.closePath();
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
      // glass reflection
      g = ctx.createLinearGradient(ix, iy, ix + iw * 0.6, iy + ih);
      g.addColorStop(0, 'rgba(255,255,255,0.08)');
      g.addColorStop(0.4, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(ix, iy, iw, ih);
      ctx.restore();
    },
  };

  function paint(ctx, el, w, h, s, time) {
    (painters[el.texture] || painters.matte)(ctx, el, w, h, s, time);
  }

  const textures = {
    list() {
      return Object.entries(A.vocab.textures).map(([id, t]) => ({ id, label: t.label }));
    },
    animated(el) {
      return el.texture === 'fireplace';
    },
    /** Draw el's texture into rect (CSS px). opts: { pxPerCm, time } */
    draw(ctx, el, rect, opts = {}) {
      const s = opts.pxPerCm || 1;
      const w = rect.w, h = rect.h;
      if (w < 1 || h < 1) return;
      ctx.save();
      ctx.globalAlpha *= el.opacity == null ? 1 : el.opacity;
      if (textures.animated(el)) {
        ctx.beginPath();
        ctx.rect(rect.x, rect.y, w, h);
        ctx.clip();
        ctx.translate(rect.x, rect.y);
        paint(ctx, el, w, h, s, opts.time || 0);
        ctx.restore();
        return;
      }
      const m = ctx.getTransform();
      const scale = Math.max(1, Math.hypot(m.a, m.b));
      const key = [el.id, el.texture, el.color, Math.round(w), Math.round(h), s.toFixed(3), scale.toFixed(2)].join('|');
      let tile = cache.get(key);
      if (tile) {
        cache.delete(key);
        cache.set(key, tile);
      } else {
        tile = document.createElement('canvas');
        tile.width = Math.max(1, Math.ceil(w * scale));
        tile.height = Math.max(1, Math.ceil(h * scale));
        const tctx = tile.getContext('2d');
        tctx.scale(scale, scale);
        paint(tctx, el, w, h, s, 0);
        cache.set(key, tile);
        if (cache.size > CACHE_MAX) cache.delete(cache.keys().next().value);
      }
      ctx.drawImage(tile, rect.x, rect.y, w, h);
      ctx.restore();
    },
    clearCache() {
      cache.clear();
    },
  };

  A.textures = textures;
})();
