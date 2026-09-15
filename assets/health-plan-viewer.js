(function (factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else api.mount(document, window);
})(function () {
  'use strict';
  function fitScale(width, height, availableWidth, availableHeight, mode = 'fit') {
    if (![width, height, availableWidth, availableHeight].every(value => value > 0)) return 1;
    return mode === 'width' ? availableWidth / width : Math.min(availableWidth / width, availableHeight / height);
  }
  function mount(document, window) {
    const viewport = document.querySelector('#map-viewport');
    const canvas = document.querySelector('#map-canvas');
    const poster = document.querySelector('#map-poster');
    const fit = document.querySelector('#map-fit');
    const fitWidth = document.querySelector('#map-fit-width');
    const plus = document.querySelector('#map-zoom-in');
    const minus = document.querySelector('#map-zoom-out');
    const output = document.querySelector('#map-zoom');
    if (!viewport || !poster) return;
    let mode = 'fit', scale = 1, frame = 0;

    function apply(nextScale, preserveCenter = false) {
      const bounds = viewport.getBoundingClientRect(), board = canvas.getBoundingClientRect();
      const centerX = (bounds.left + viewport.clientWidth / 2 - board.left) / scale;
      const centerY = (bounds.top + viewport.clientHeight / 2 - board.top) / scale;
      scale = Math.max(.025, Math.min(3, nextScale));
      canvas.style.width = Math.ceil(poster.offsetWidth * scale) + 'px';
      canvas.style.height = Math.ceil(poster.offsetHeight * scale) + 'px';
      poster.style.transform = `scale(${scale})`;
      output.value = Math.round(scale * 100) + '%';
      fit.setAttribute('aria-pressed', String(mode === 'fit'));
      fitWidth.setAttribute('aria-pressed', String(mode === 'width'));
      plus.disabled = scale >= 3;
      minus.disabled = scale <= .025;
      viewport.classList.toggle('is-pannable', poster.offsetWidth * scale > viewport.clientWidth || poster.offsetHeight * scale > viewport.clientHeight);
      if (preserveCenter) viewport.scrollTo({ left: centerX * scale - viewport.clientWidth / 2, top: centerY * scale - viewport.clientHeight / 2, behavior: 'instant' });
      else if (mode !== 'manual') viewport.scrollTo({ left: 0, top: 0, behavior: 'instant' });
    }
    function resize() {
      if (mode === 'manual') { apply(scale); return; }
      const style = window.getComputedStyle(viewport);
      const width = viewport.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight) - 2;
      const height = viewport.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom) - 2;
      // Give wide windows more columns of logos, not oversized gutters around a tall poster.
      const expanded = poster.classList.contains('expanded-landscape');
      poster.style.width = Math.min(expanded ? 6400 : 3600, Math.max(expanded ? 3000 : 2400, Math.round(width / height * (expanded ? 25 : 15)) * 100)) + 'px';
      apply(fitScale(poster.offsetWidth, poster.offsetHeight, width, height, mode));
    }
    function scheduleResize() {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(resize);
    }
    function zoom(factor) { mode = 'manual'; apply(scale * factor, true); }
    fit.addEventListener('click', () => { mode = 'fit'; resize(); });
    fitWidth.addEventListener('click', () => { mode = 'width'; resize(); });
    plus.addEventListener('click', () => zoom(1.3));
    minus.addEventListener('click', () => zoom(1 / 1.3));
    const labels = document.querySelector('#map-labels');
    labels.addEventListener('click', () => {
      const shown = canvas.classList.toggle('show-company-labels');
      labels.setAttribute('aria-pressed', String(shown));
      scheduleResize();
    });
    viewport.addEventListener('keydown', event => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.key === '+' || event.key === '=') { event.preventDefault(); zoom(1.3); }
      if (event.key === '-') { event.preventDefault(); zoom(1 / 1.3); }
      if (event.key === '0') { event.preventDefault(); mode = 'fit'; resize(); }
    });
    new window.ResizeObserver(scheduleResize).observe(viewport);
    new window.ResizeObserver(scheduleResize).observe(poster);
    window.addEventListener('resize', scheduleResize);
    window.addEventListener('healthcare:refit', () => { mode = 'fit'; scheduleResize(); });
    document.fonts?.ready.then(scheduleResize);

    // Mouse dragging complements native touch and trackpad scrolling when zoomed in.
    let drag, suppressClickUntil = 0;
    viewport.addEventListener('pointerdown', event => {
      if (event.pointerType !== 'mouse' || event.button !== 0 || !viewport.classList.contains('is-pannable')) return;
      drag = { x: event.clientX, y: event.clientY, left: viewport.scrollLeft, top: viewport.scrollTop, moved: false };
    });
    viewport.addEventListener('pointermove', event => {
      if (!drag) return;
      const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
      if (!drag.moved && Math.hypot(dx, dy) < 5) return;
      drag.moved = true;
      viewport.setPointerCapture(event.pointerId);
      viewport.classList.add('is-panning');
      viewport.scrollLeft = drag.left - dx;
      viewport.scrollTop = drag.top - dy;
    });
    function endDrag(event) {
      if (drag?.moved) suppressClickUntil = Date.now() + 300;
      drag = null;
      viewport.classList.remove('is-panning');
      if (viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
    }
    viewport.addEventListener('pointerup', endDrag);
    viewport.addEventListener('pointercancel', endDrag);
    viewport.addEventListener('dragstart', event => { if (drag) event.preventDefault(); });
    viewport.addEventListener('click', event => {
      if (Date.now() < suppressClickUntil) { event.preventDefault(); event.stopPropagation(); }
    }, true);
    const sources = document.querySelector('#map-sources-dialog');
    const sourceButton = document.querySelector('#map-sources');
    sourceButton.addEventListener('click', () => sources.showModal());
    document.querySelector('#map-close-sources').addEventListener('click', () => sources.close());
    sources.addEventListener('close', () => sourceButton.focus());
    scheduleResize();
  }
  return { fitScale, mount };
});
