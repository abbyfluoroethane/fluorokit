// Metro motion that needs a script: the page-exit, continuum, tilt and the
// panorama.
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

// Where the last continuum() item was: read by continuumIn().
let flight = null;

/**
 * Continuum, first half: the rest of `page` leaves, and `item` stays where
 * it is. Call it in the click handler of a list item, before the change to
 * the next page. Then mount the next page and call continuumIn() on its
 * header: the header starts where the item was and moves into place.
 *
 * "The rest of the page" is every sibling of the item, then every sibling
 * of its parent, and so on up to `page`. They leave top to bottom, a short
 * stagger apart.
 *
 * The way back is the same call the other way round: continuum() on the
 * header, then continuumIn() on the list item.
 *
 * For a site of separate pages, keep the returned position (in
 * sessionStorage, for example) and give it to continuumIn() on the next
 * page as `from`.
 *
 * @param {Element | null | undefined} item the tapped element, or the part of it that moves (its title)
 * @param {{ page?: Element | null, kind?: 'slide' | 'turnstile' }} [options] `page`: the element that holds the page (default: the parent of the item). `kind`: how the rest leaves.
 * @returns {Promise<{ left: number, top: number, fontSize: number } | null>} where the item is (viewport px), when the rest of the page is gone, or at once with reduced motion
 */
export async function continuum(item, { page, kind = 'slide' } = {}) {
  if (!item || typeof document === 'undefined') return null;
  const root = page && page.contains(item) ? page : item.parentElement;
  const rest = [];
  for (let node = item; node && node !== root && node.parentElement; node = node.parentElement) {
    for (const sibling of node.parentElement.children) if (sibling !== node) rest.push(sibling);
    if (node.parentElement === root) break;
  }
  // Top to bottom, as the eye reads the page.
  const tops = new Map(rest.map((el) => [el, el.getBoundingClientRect().top]));
  rest.sort((a, b) => tops.get(a) - tops.get(b));
  const cls = kind === 'turnstile' ? 'fk-turnstile-out' : 'fk-exit';
  rest.forEach((el, i) => {
    // A short stagger: the item waits for the rest to leave.
    if (el instanceof HTMLElement) el.style.setProperty('--i', String(Math.min(i, 2)));
    el.classList.remove('fk-turnstile-in', 'fk-enter', 'fk-continuum-in');
    el.classList.add(cls);
  });
  const r = item.getBoundingClientRect();
  const at = { left: r.left, top: r.top, fontSize: parseFloat(getComputedStyle(item).fontSize) };
  flight = { ...at, at: performance.now() };
  const running = rest.flatMap((el) => (typeof el.getAnimations === 'function' ? el.getAnimations() : []));
  await Promise.all(running.map((a) => a.finished.catch(() => {})));
  return at;
}

/**
 * Continuum, second half: the header of the new page starts where the
 * continuum() item was, at the size of the item, and moves and grows into
 * place. Call it right after the new page mounts. With no continuum() in
 * the last 2 seconds and no `from`, the header slides in from the left
 * instead.
 *
 * @param {Element | null | undefined} el the header of the new page
 * @param {{ from?: { left: number, top: number, fontSize: number } | null }} [options] `from`: a position that continuum() returned, on this page or the one before
 * @returns {Promise<void>} resolves when the header is in place
 */
export async function continuumIn(el, { from: given = null } = {}) {
  if (!el || typeof document === 'undefined') return;
  const from = given ?? (flight && performance.now() - flight.at < 2000 ? flight : null);
  flight = null;
  if (el instanceof HTMLElement) {
    if (getComputedStyle(el).display === 'inline') el.style.display = 'inline-block';
    if (from) {
      // Measure the resting place: no enter animation may move the box.
      el.style.animation = 'none';
      const r = el.getBoundingClientRect();
      el.style.animation = '';
      const size = parseFloat(getComputedStyle(el).fontSize) || from.fontSize;
      // Under CSS zoom, one CSS px of transform is `zoom` viewport px.
      const zoom = el.offsetWidth ? r.width / el.offsetWidth : 1;
      el.style.setProperty('--fk-continuum-dx', `${((from.left - r.left) / zoom).toFixed(1)}px`);
      el.style.setProperty('--fk-continuum-dy', `${((from.top - r.top) / zoom).toFixed(1)}px`);
      el.style.setProperty('--fk-continuum-scale', (from.fontSize / size).toFixed(4));
      el.style.setProperty('--fk-continuum-from-opacity', '1');
    }
  }
  el.classList.add('fk-continuum-in');
  const running = typeof el.getAnimations === 'function' ? el.getAnimations() : [];
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
