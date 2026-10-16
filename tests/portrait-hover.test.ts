import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHoverToReveal, PORTRAIT_HOVER_MS } from '../src/lib/hoverToReveal';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const component = fs.readFileSync(new URL('../src/components/common/PortraitReveal.astro', import.meta.url), 'utf8');
const clientSource = component.match(/<script>([\s\S]*?)<\/script>/)![1];
const clientCode = ts.transpileModule(clientSource, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

function mountPortrait() {
  class Button extends EventTarget {
    dataset: Record<string, string> = {};
    image = { src: '/images/v4/portrait.jpg', alt: '川岸 翼', style: { objectPosition: '' } };
    status = { textContent: '' };
    attributes: Record<string, string> = {};
    keyboardFocus = false;
    querySelector(selector: string) { return selector === 'img' ? this.image : this.status; }
    setAttribute(name: string, value: string) { this.attributes[name] = value; }
    matches(selector: string) { return selector === ':focus-visible' && this.keyboardFocus; }
  }
  const button = new Button();
  const pageWindow = new EventTarget();
  const pageDocument = Object.assign(new EventTarget(), { hidden: false, querySelectorAll: () => [button] });
  vm.runInNewContext(clientCode, {
    window: pageWindow, document: pageDocument, exports: {},
    require: (path: string) => {
      assert.equal(path, '../../lib/hoverToReveal');
      return { createHoverToReveal };
    },
  });
  const send = (target: EventTarget, type: string, fields = {}) => {
    const event = Object.assign(new Event(type, { cancelable: true }), fields);
    target.dispatchEvent(event);
    return event;
  };
  const enter = () => send(button, 'pointerenter', { pointerType: 'mouse' });
  return { button, pageWindow, pageDocument, send, enter };
}

test('portrait: production hover duration is exactly ten seconds', () => {
  assert.equal(PORTRAIT_HOVER_MS, 10_000);
});

test('portrait: pointer hover starts fading at ten seconds without pressing', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const { button, send, enter } = mountPortrait();
  enter();
  t.mock.timers.tick(9_999);
  assert.equal(button.dataset.revealed, undefined);
  t.mock.timers.tick(1);
  assert.equal(button.dataset.revealed, 'true');
  assert.equal(button.attributes['aria-pressed'], 'true');
  send(button, 'pointerleave');
  assert.equal(button.dataset.revealed, 'true');
});

for (const interruption of ['leave', 'hidden', 'blur', 'scroll']) {
  test(`portrait: ${interruption} resets the hover countdown`, (t) => {
    t.mock.timers.enable({ apis: ['setTimeout'] });
    const { button, pageWindow, pageDocument, send, enter } = mountPortrait();
    enter();
    t.mock.timers.tick(9_000);
    if (interruption === 'leave') send(button, 'pointerleave');
    if (interruption === 'hidden') {
      pageDocument.hidden = true;
      send(pageDocument, 'visibilitychange');
      pageDocument.hidden = false;
    }
    if (interruption === 'blur' || interruption === 'scroll') send(pageWindow, interruption);
    t.mock.timers.tick(10_000);
    assert.equal(button.dataset.revealed, undefined);
    enter();
    t.mock.timers.tick(9_999);
    assert.equal(button.dataset.revealed, undefined);
    t.mock.timers.tick(1);
    assert.equal(button.dataset.revealed, 'true');
  });
}

test('portrait: touch and pressing alone do not start the hover countdown', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const { button, send } = mountPortrait();
  send(button, 'pointerenter', { pointerType: 'touch' });
  send(button, 'pointerdown', { pointerType: 'touch', isPrimary: true, button: 0 });
  send(button, 'focus');
  send(button, 'keydown', { key: 'Enter', repeat: false });
  t.mock.timers.tick(10_000);
  assert.equal(button.dataset.revealed, undefined);
});

test('portrait: keyboard focus is an accessible equivalent to hover', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const { button, send } = mountPortrait();
  button.keyboardFocus = true;
  send(button, 'focus');
  t.mock.timers.tick(9_000);
  send(button, 'blur');
  t.mock.timers.tick(10_000);
  assert.equal(button.dataset.revealed, undefined);
  send(button, 'focus');
  t.mock.timers.tick(10_000);
  assert.equal(button.dataset.revealed, 'true');
});
