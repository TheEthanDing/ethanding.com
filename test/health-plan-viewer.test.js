const test = require('node:test');
const assert = require('node:assert/strict');
const { fitScale, mount, balanceRows } = require('../assets/health-plan-viewer');

test('whole-map fit respects both window dimensions on phones, laptops, and wide monitors', () => {
  for (const [width, height] of [[298, 650], [368, 720], [746, 850], [1002, 670], [1418, 770], [2540, 1360]]) {
    for (const canvasHeight of [1100, 1400, 1800]) {
      const scale = fitScale(2400, canvasHeight, width, height);
      assert.ok(2400 * scale <= width + .001);
      assert.ok(canvasHeight * scale <= height + .001);
      assert.ok(Math.abs(2400 * scale - width) < .001 || Math.abs(canvasHeight * scale - height) < .001);
    }
  }
});
test('fit-width uses the available width even when closer inspection needs vertical scrolling', () => {
  const scale = fitScale(2400, 1500, 1420, 600, 'width');
  assert.equal(2400 * scale, 1420);
  assert.ok(1500 * scale > 600);
});
test('temporarily unmeasurable canvases never produce an invalid transform', () => {
  assert.equal(fitScale(0, 1500, 1420, 600), 1);
  assert.equal(fitScale(2400, 1500, 0, 600), 1);
});

// Supply DOM event/measurement boundaries while exercising the real viewer.
function viewerFixture(width = 1422, height = 650) {
  function element() {
    const handlers = new Map(), classes = new Set(), attributes = new Map();
    return {
      style: {}, scrollLeft: 0, scrollTop: 0,
      classList: {
        contains: value => classes.has(value),
        add: value => classes.add(value), remove: value => classes.delete(value),
        toggle(value, force = !classes.has(value)) {
          if (force) classes.add(value); else classes.delete(value);
          return force;
        },
      },
      addEventListener(name, handler) { handlers.set(name, handler); },
      fire(name, event = {}) { handlers.get(name)?.(event); },
      setAttribute(name, value) { attributes.set(name, value); },
      getAttribute(name) { return attributes.get(name); },
      getBoundingClientRect: () => ({ left: 0, top: 0 }),
      scrollTo({ left, top }) { this.scrollLeft = left; this.scrollTop = top; },
    };
  }
  const nodes = Object.fromEntries(['viewport', 'canvas', 'poster', 'fit', 'fit-width', 'zoom-in', 'zoom-out', 'zoom', 'labels', 'sources-dialog', 'sources', 'close-sources'].map(id => ['#map-' + id, element()]));
  const viewport = nodes['#map-viewport'], poster = nodes['#map-poster'];
  viewport.clientWidth = width;
  viewport.clientHeight = height;
  poster.classList.add('expanded-landscape');
  poster.offsetHeight = 2200;
  Object.defineProperty(poster, 'offsetWidth', { get: () => parseFloat(poster.style.width) || 3200 });
  let pending;
  const window = Object.assign(element(), {
    getComputedStyle: () => ({ paddingLeft: '10', paddingRight: '10', paddingTop: '10', paddingBottom: '10' }),
    cancelAnimationFrame() { pending = undefined; },
    requestAnimationFrame(callback) { pending = callback; return 1; },
    ResizeObserver: class { observe() {} },
  });
  const flush = () => { const callback = pending; pending = undefined; callback?.(); };
  mount({ querySelector: selector => nodes[selector], querySelectorAll: () => [] }, window);
  flush();
  return { nodes, viewport, poster, window, flush, click(id) { nodes['#map-' + id].fire('click'); flush(); } };
}

test('the map opens at fit width instead of shrinking the whole poster into the window', () => {
  const { nodes, viewport } = viewerFixture();
  assert.equal(nodes['#map-fit-width'].getAttribute('aria-pressed'), 'true');
  assert.equal(parseFloat(nodes['#map-canvas'].style.width), viewport.clientWidth - 22);
  assert.ok(parseFloat(nodes['#map-canvas'].style.height) > viewport.clientHeight);
});

test('wide or short windows do not inflate the logical canvas and spread logos apart', () => {
  for (const [width, height] of [[390, 700], [1422, 650], [3000, 600]]) {
    const { poster } = viewerFixture(width, height);
    assert.equal(poster.offsetWidth, 3200);
  }
});

test('Fit map still shows the whole poster, and inspector refits retain the selected zoom mode', () => {
  const viewer = viewerFixture();
  viewer.click('fit');
  const canvas = viewer.nodes['#map-canvas'];
  assert.ok(parseFloat(canvas.style.height) <= viewer.viewport.clientHeight - 22);
  assert.ok(parseFloat(canvas.style.width) <= viewer.viewport.clientWidth - 22);
  viewer.window.fire('healthcare:refit'); viewer.flush();
  assert.equal(viewer.nodes['#map-fit'].getAttribute('aria-pressed'), 'true');
  viewer.click('fit-width');
  viewer.viewport.clientWidth -= 390;
  viewer.window.fire('healthcare:refit'); viewer.flush();
  assert.equal(viewer.nodes['#map-fit-width'].getAttribute('aria-pressed'), 'true');
  assert.equal(parseFloat(canvas.style.width), viewer.viewport.clientWidth - 22);
  viewer.click('zoom-in');
  const transform = viewer.poster.style.transform;
  viewer.window.fire('healthcare:refit'); viewer.flush();
  assert.equal(viewer.poster.style.transform, transform);
});

test('category packing balances rows without stranding the last categories or changing their order', () => {
  const weights = Array(16).fill(5);
  const rows = balanceRows(weights, 34);
  assert.deepEqual(rows.map(row => row.length), [5, 5, 6]);
  assert.deepEqual(rows.flat(), weights.map((_, index) => index));
  assert.deepEqual(balanceRows([], 34), []);
  assert.deepEqual(balanceRows([3, 7], 34), [[0, 1]]);
  assert.deepEqual(balanceRows([80, 3], 34), [[0], [1]]);
  const uneven = [3, 8, 5, 7, 3, 6, 8, 4, 4, 5];
  const packed = balanceRows(uneven, 34);
  assert.deepEqual(packed.flat(), uneven.map((_, index) => index));
  assert.ok(Math.abs(packed[0].reduce((n,i)=>n+uneven[i],0) - packed[1].reduce((n,i)=>n+uneven[i],0)) <= 8);
});

test('opening details keeps the current map region, while explicit Fit controls return to the top', () => {
  const viewer = viewerFixture();
  viewer.viewport.scrollTop = 450;
  // A scrolled canvas is above the viewport in real browser measurements.
  viewer.nodes['#map-canvas'].getBoundingClientRect = () => ({ left: 10, top: 10 - viewer.viewport.scrollTop });
  viewer.window.fire('healthcare:refit'); viewer.flush();
  assert.equal(viewer.viewport.scrollTop, 450, 'unchanged refits must not drift by the viewport padding');
  viewer.viewport.clientWidth -= 390;
  viewer.window.fire('healthcare:refit'); viewer.flush();
  assert.ok(viewer.viewport.scrollTop > 200, 'an inspector resize must not jump back to the masthead');
  viewer.click('fit-width');
  assert.equal(viewer.viewport.scrollTop, 0);
});
