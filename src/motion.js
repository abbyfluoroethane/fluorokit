// Metro motion that needs a script: the page-exit, tilt and the panorama.
// The styles are in fluorokit/base.css. Each function does nothing on the
// server (no document), so it is safe to import in SSR code.

/**
 * Play the exit animation on an element and wait for it to end. Call it
 * before the state change that removes the old page, then remount the
 * page: the element stays hidden at the end.
 *
 * Set the direction first (setEnterDirection from fluorokit/enter), so the
 * old page leaves on the side away from the new one.
 *
 * With `children: true`, each direct child leaves on its own, a stagger
 * apart, top to bottom (the turnstile feather).
 *
 * @param {Element | null | undefined} el
 * @param {{ kind?: 'slide' | 'turnstile', children?: boolean }} [options]
 * @returns {Promise<void>} resolves when every animation ends, or at once with reduced motion
 */
export async function leave(el, { kind = 'slide', children = false } = {}) {
  if (!el || typeof document === 'undefined') return;
  const cls = kind === 'turnstile' ? 'fk-turnstile-out' : 'fk-exit';
  const targets = children ? [...el.children] : [el];
  targets.forEach((t, i) => {
    if (children && t instanceof HTMLElement && !t.style.getPropertyValue('--i')) t.style.setProperty('--i', String(i));
    t.classList.remove('fk-turnstile-in', 'fk-enter');
    t.classList.add(cls);
  });
  const running = targets.flatMap((t) => (typeof t.getAnimations === 'function' ? t.getAnimations() : []));
  await Promise.all(running.map((a) => a.finished.catch(() => {})));
}

/**
 * Turn on tilt for each `.fk-tilt` element in `root`, now and later (one
 * listener on the root). A pressed element tips toward the press point
 * and follows the pointer while it is down.
 *
 * @param {Document | HTMLElement} [root] default: the document
 * @returns {() => void} a function that turns tilt off again
 */
export function attachTilt(root) {
  if (typeof document === 'undefined') return () => {};
  const host = root ?? document;
  let active = null;

  const aim = (el, x, y) => {
    const r = el.getBoundingClientRect();
    const clamp = (v) => Math.max(-1, Math.min(1, v));
    const nx = clamp((x - (r.left + r.width / 2)) / (r.width / 2));
    const ny = clamp((y - (r.top + r.height / 2)) / (r.height / 2));
    el.style.setProperty('--fk-tilt-x', nx.toFixed(3));
    el.style.setProperty('--fk-tilt-y', ny.toFixed(3));
    el.style.setProperty('--fk-tilt-sink', (1 - Math.max(Math.abs(nx), Math.abs(ny))).toFixed(3));
  };
  const release = () => {
    if (!active) return;
    active.classList.remove('fk-tilting');
    active = null;
  };
  const down = (e) => {
    if (e.button !== 0) return;
    const el = e.target instanceof Element ? e.target.closest('.fk-tilt') : null;
    if (!el || !host.contains(el) || el.matches(':disabled, [aria-disabled="true"]')) return;
    active = el;
    aim(el, e.clientX, e.clientY);
    el.classList.add('fk-tilting');
  };
  const move = (e) => {
    if (!active) return;
    const r = active.getBoundingClientRect();
    const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    // Off the element, the press is cancelled, as on the phone.
    if (inside) aim(active, e.clientX, e.clientY);
    else release();
  };

  host.addEventListener('pointerdown', down);
  window.addEventListener('pointermove', move, { passive: true });
  window.addEventListener('pointerup', release);
  window.addEventListener('pointercancel', release);
  window.addEventListener('blur', release);
  return () => {
    release();
    host.removeEventListener('pointerdown', down);
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', release);
    window.removeEventListener('pointercancel', release);
    window.removeEventListener('blur', release);
  };
}

/**
 * Drive the layers of a `.fk-panorama`: set --fk-pan on it to the scroll
 * offset of its `.fk-panorama-track`, once a frame at most.
 *
 * @param {HTMLElement} el the .fk-panorama element
 * @returns {() => void} a function that stops it
 */
export function attachPanorama(el) {
  const track = el?.querySelector('.fk-panorama-track');
  if (!track) return () => {};
  let frame = 0;
  const update = () => {
    frame = 0;
    el.style.setProperty('--fk-pan', String(Math.round(track.scrollLeft)));
  };
  const onScroll = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };
  track.addEventListener('scroll', onScroll, { passive: true });
  update();
  return () => {
    track.removeEventListener('scroll', onScroll);
    if (frame) cancelAnimationFrame(frame);
  };
}
