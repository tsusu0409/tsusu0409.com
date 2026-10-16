import { test } from 'node:test';
import assert from 'node:assert/strict';
import { titleSize } from '../src/lib/og';

test('titleSize: 2行に収まれば66px、長いタイトルだけ小さくする', () => {
  assert.equal(titleSize('tsusu0409.com ver3.0 アップデート'), 66);
  assert.equal(titleSize('あ'.repeat(40)), 52);
  assert.equal(titleSize('あ'.repeat(70)), 44);
});
