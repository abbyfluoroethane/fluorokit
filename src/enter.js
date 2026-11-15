// Direction for the Metro page-enter. `.fk-enter` slides in from the right
// when --fk-enter-dir is 1 and from the left when it is -1.

/**
 * Point the next page-enter at the side the new item lies on: from the right
 * when `to` comes after `from` in `items`, from the left when it comes before.
 * Call it before the state change that mounts the new content. Pivot does
 * this on its own; call it yourself when code changes the page (a menu
 * command, a keyboard shortcut).
 *
 * @template T
 * @param {readonly T[]} items the pages in display order
 * @param {T} from the current page
 * @param {T} to the page that will show
 * @param {HTMLElement | null} [scope] the element that holds the entering content. Default: the root element.
 * @returns {1 | -1 | 0} the direction, or 0 when nothing changes
 */
export function setEnterDirection(items, from, to, scope) {
  const a = items.indexOf(from);
  const b = items.indexOf(to);
  if (a === b || b === -1) return 0;
  const dir = b > a ? 1 : -1;
  if (typeof document !== 'undefined') {
    (scope ?? document.documentElement).style.setProperty('--fk-enter-dir', String(dir));
  }
  return dir;
}

/**
 * For a site of separate pages. Point the page-enter at the side this page
 * lies on, seen from the page the visitor came from (document.referrer):
 * - a section further right in `paths` comes from the right, one further
 *   left from the left;
 * - in one section, a deeper page comes from the right and a shallower one
 *   (back to the index) from the left.
 * A first visit, or one from a different site, comes from the right.
 *
 * Run it in the <head>, before the first paint. Use enterDirectionScript for
 * that. The function uses nothing outside its own body, so that its source
 * can be put inline.
 *
 * @param {readonly string[]} paths the section roots in display order, for example ['/', '/blog/', '/projects/']
 * @returns {1 | -1} the direction
 */
export function enterDirectionFromReferrer(paths) {
  let dir = 1;
  try {
    const from = document.referrer ? new URL(document.referrer) : null;
    if (from && from.origin === location.origin) {
      const norm = (p) => (p.endsWith('/') ? p : p + '/');
      // The section is the longest root the path starts with.
      const section = (p) => {
        let best = -1;
        paths.forEach((root, i) => {
          if (norm(p).startsWith(norm(root)) && (best === -1 || root.length > paths[best].length)) best = i;
        });
        return best;
      };
      const depth = (p) => p.split('/').filter(Boolean).length;
      const a = section(from.pathname);
      const b = section(location.pathname);
      if (a !== -1 && b !== -1 && a !== b) dir = b > a ? 1 : -1;
      else if (depth(location.pathname) < depth(from.pathname)) dir = -1;
    }
  } catch {
    // A referrer that is not a URL: keep the default.
  }
  document.documentElement.style.setProperty('--fk-enter-dir', String(dir));
  return dir;
}

/**
 * The source of an inline script that calls enterDirectionFromReferrer.
 * Put it in the <head>:
 *   <script is:inline set:html={enterDirectionScript(['/', '/blog/'])} />
 *
 * @param {readonly string[]} paths the section roots in display order
 * @returns {string}
 */
export function enterDirectionScript(paths) {
  const json = JSON.stringify(paths).replace(/</g, '\\u003c');
  return `(${enterDirectionFromReferrer})(${json})`;
}
