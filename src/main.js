/* Arch2D — Application bootstrap (Phase 2). */
(function () {
  'use strict';
  const A = window.Arch2D;

  async function bootstrap() {
    // 1. Initialize UI shell and event listeners
    A.ui.init();

    // 2. Initialize interactive canvas in host element
    const canvasHost = document.getElementById('canvas-host');
    A.canvas.init(canvasHost);

    // 3. Initialize global keyboard shortcuts
    A.input.init();

    // 4. Initialize AI Studio modal
    A.studio.init();

    // 5. Check autosave state vs default template (project.md §5.2)
    let restored = false;
    if (A.persistence.hasAutosave()) {
      const saved = A.persistence.readAutosave();
      if (saved && saved.elements && saved.elements.length > 0) {
        const doRestore = await A.ui.confirm({
          title: 'Restore Previous Session?',
          message: `Found an autosaved media wall ("${saved.name}" with ${saved.elements.length} components). Would you like to restore it?`,
          okLabel: 'Restore Session',
          cancelLabel: 'Start Fresh',
        });
        if (doRestore) {
          A.store.reset(saved);
          restored = true;
          A.ui.toast('Restored previous session.', 'success');
        }
      }
    }

    if (!restored) {
      // Load starter template (Japandi Slats) so user immediately gets a gorgeous elevation
      const defaultTpl = A.templates.get('japandi-slats');
      if (defaultTpl) {
        A.store.reset(defaultTpl);
      }
    }

    // Fit canvas view to current wall
    A.canvas.fit();

    // 6. Start autosave listener
    A.persistence.startAutosave();

    // Notify ready
    A.bus.emit('app:ready');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})();
