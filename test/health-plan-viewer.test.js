const test = require('node:test');
const assert = require('node:assert/strict');
const { fitScale } = require('../assets/health-plan-viewer');

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
