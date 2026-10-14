/* Arch2D — shared namespace and utilities (Phase 0). See CONTRACTS.md. */
(function () {
  'use strict';
  const A = (window.Arch2D = window.Arch2D || {});
  A.version = '2.0.0';

  const util = {
    uid() {
      return 'el_' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
    },
    clamp(v, a, b) {
      return Math.min(b, Math.max(a, v));
    },
    round(v, step = 1) {
      return Math.round(v / step) * step;
    },
    clone(o) {
      return JSON.parse(JSON.stringify(o));
    },
    /** Tiny DOM builder: h('div', {class:'x', onclick: fn}, 'text', childNode) */
    h(tag, attrs, ...children) {
      const node = document.createElement(tag);
      if (attrs) {
        for (const [k, v] of Object.entries(attrs)) {
          if (v === undefined || v === null || v === false) continue;
          if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
          else if (k === 'class') node.className = v;
          else if (k === 'style' && typeof v === 'object') Object.assign(node.style, v);
          else if (k === 'html') node.innerHTML = v;
          else if (k in node && typeof v !== 'string') node[k] = v;
          else node.setAttribute(k, v === true ? '' : v);
        }
      }
      for (const c of children.flat()) {
        if (c === null || c === undefined || c === false) continue;
        node.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(String(c)) : c);
      }
      return node;
    },
    downloadBlob(blob, name) {
      const url = URL.createObjectURL(blob);
      util.downloadDataUrl(url, name);
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    },
    downloadDataUrl(url, name) {
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
    },
    debounce(fn, ms) {
      let t;
      return function (...args) {
        clearTimeout(t);
        t = setTimeout(() => fn.apply(this, args), ms);
      };
    },
    hashString(s) {
      let h = 2166136261 >>> 0;
      for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 16777619) >>> 0;
      }
      return h >>> 0;
    },
    /** Deterministic PRNG (mulberry32). */
    rng(seed) {
      let a = seed >>> 0;
      return function () {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    },
    hexToRgb(hex) {
      let h = String(hex || '#000000').replace('#', '');
      if (h.length === 3) h = h.split('').map((c) => c + c).join('');
      const n = parseInt(h, 16) || 0;
      return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
    },
    rgba(hex, a) {
      const { r, g, b } = util.hexToRgb(hex);
      return `rgba(${r},${g},${b},${a})`;
    },
    /** amt in [-1, 1]: negative darkens, positive lightens. */
    shade(hex, amt) {
      const { r, g, b } = util.hexToRgb(hex);
      const f = (c) => Math.round(amt < 0 ? c * (1 + amt) : c + (255 - c) * amt);
      return '#' + [f(r), f(g), f(b)].map((c) => util.clamp(c, 0, 255).toString(16).padStart(2, '0')).join('');
    },
    luminance(hex) {
      const { r, g, b } = util.hexToRgb(hex);
      return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    },
    isTypingTarget(el) {
      if (!el) return false;
      const tag = el.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
    },
  };

  A.util = util;
})();
