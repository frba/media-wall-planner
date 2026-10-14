/* Arch2D — event bus (Phase 0). */
(function () {
  'use strict';
  const A = window.Arch2D;
  const handlers = new Map();

  A.bus = {
    on(evt, fn) {
      if (!handlers.has(evt)) handlers.set(evt, new Set());
      handlers.get(evt).add(fn);
      return () => A.bus.off(evt, fn);
    },
    off(evt, fn) {
      const set = handlers.get(evt);
      if (set) set.delete(fn);
    },
    emit(evt, payload) {
      const set = handlers.get(evt);
      if (!set) return;
      for (const fn of [...set]) {
        try {
          fn(payload);
        } catch (err) {
          console.error(`[Arch2D bus] handler for "${evt}" failed:`, err);
        }
      }
    },
  };
})();
