# fluorokit

A Metro theme for shadcn-svelte. Add components with the shadcn-svelte CLI as
usual and import a fluorokit theme: the components take the look, and nothing
is forked. It also adds Metro pieces that shadcn-svelte doesn't have (tiles, a
pivot, the type scale, a direction-aware page-enter), which also work as plain
CSS without Svelte.

The structure is the same in each project: zero radius, a light-weight type
scale, one left edge. A theme is a palette and a set of fonts.

## Showcase site

The showcase and the theme builder are in a separate repo,
[fluorokit-site](https://github.com/abbyfluoroethane/fluorokit-site), live at
<https://fluorokit.bigaouette.com/>.

## Presets and the command

A preset is six named choices, as a short code: `f009000`. The create page of
the site makes the code. The command writes the theme of a code:

```sh
npx fluorokit theme --preset f009000 --out src/theme.css
npx fluorokit theme --preset f009000 --format json --out tokens/themes/mine.json
```

`--format` is `shadcn` (CSS with the shadcn names, the default), `css` (the
fluorokit variables only) or `json` (a theme file for the kit).

## Build

```sh
npm run build
```

| File | Contents |
| --- | --- |
| `dist/structure.css` | Spacing, shape, type scale and motion |
| `dist/themes/<name>.css` | One theme: colors and fonts |
| `dist/themes/<name>.shadcn.css` | The same theme, plus the shadcn variable names |
| `dist/base.css` | Type classes, the energy bar, status, the pivot, `.fk-enter` |
| `dist/tailwind.css` | Tailwind 4 `@theme` mapping for shadcn-svelte |
| `dist/shiki/<name>-<scheme>.json` | A Shiki syntax theme for code blocks, for a theme that has syntax colors |
| `dist/fonts/selawik.css` | The Selawik font, for the `zune` theme |
| `dist/tools/` | The theme recipe (`fluoro.mjs`), the presets (`presets.mjs`) and the CSS writer (`theme-css.mjs`), as modules for the browser or Node |
| `dist/enter.js` | `setEnterDirection`, for a direction-aware page-enter |
| `dist/svelte/` | Svelte 5 components: `Pivot` |

Every fluorokit variable and class has the `fk` prefix (`--fk-base`,
`.fk-title`). The shadcn names `--muted` and `--accent` mean different things
from `--fk-muted` and `--fk-accent`, so the two sets do not share a namespace.

## Use

Plain CSS:

```js
import 'fluorokit/structure.css';
import 'fluorokit/themes/catppuccin.css';
import 'fluorokit/base.css';
```

Tailwind 4 with shadcn-svelte:

```css
@import 'tailwindcss';
@import 'fluorokit/structure.css';
@import 'fluorokit/themes/zune.shadcn.css';
@import 'fluorokit/tailwind.css';
@import 'fluorokit/base.css' layer(components);
```

The `components` layer lets Tailwind utilities override the kit's classes.

Selawik, the sans font of the `zune` theme, is included (SIL Open Font
License 1.1):

```css
@import 'fluorokit/fonts/selawik.css';
```

IBM Plex is not included. For a theme that names it, the project supplies
the `@font-face` rules, from `@fontsource/ibm-plex-sans` for example.

## Page-enter and pivots

Put `.fk-enter` on content that mounts when the page changes. It fades in
while it slides 80px into place. Set `--i` (0, 1, 2 ...) on siblings to
stagger them.

The slide is direction-aware by default. `Pivot` sets `--fk-enter-dir` on the
root element at each click: 1 when the new header is to the right, -1 when it
is to the left. Thus a page comes from the side its header lies on. This is
the same for a top-level pivot and a subpivot.

```svelte
<script>
  import Pivot from 'fluorokit/svelte/Pivot.svelte';
  let page = $state('music');
</script>

<Pivot items={['music', 'videos', 'pictures']} bind:value={page} size="subpivot" />
{#key page}
  <section class="fk-enter">...</section>
{/key}
```

When code changes the page (a menu command, a shortcut), call
`setEnterDirection(items, from, to)` from `fluorokit/enter` before the
change. To keep the direction local, give `Pivot` a `scope` element, or set
`--fk-enter-dir` on a container.

On a site of separate pages (Astro), the direction comes from the page the
visitor came from. Put this in the `<head>`, with the section roots in the
order of the nav:

```astro
---
import { enterDirectionScript } from 'fluorokit/enter';
---
<script is:inline set:html={enterDirectionScript(['/', '/blog/', '/projects/'])} />
```

A section further right comes from the right, and one further left from the
left. In one section, a deeper page comes from the right and the way back
from the left.

## Themes

| Theme | Modes | Follows the OS setting |
| --- | --- | --- |
| `catppuccin` | `mocha` (default), `latte`, `paper` (print) | Yes |
| `ink`, `blueberry`, `twilight`, `cobalt` | `freon` (default, dark), `teflon` (light), `paper` (print) | Yes |
| `zune` | `light` (default), `dark` | No: the app sets the mode |

Select a mode with `data-theme="<mode>"` on the root element. The `.dark` and
`.light` classes also select the mode with that color scheme.

Tailwind's `dark:` variant applies under `.dark` or `data-theme="dark"`. With
`catppuccin` in a shadcn-svelte project, put `.dark` on the root element for Mocha.

`ink`, `blueberry`, `twilight` and `cobalt` are the fluoro family, the house
palette. They share light pink and light blue accents and strong tiles with
white text, and differ in the base: `ink` is almost black, `blueberry` a
saturated blue, `twilight` a rich violet, `cobalt` a brighter blue. They are
generated: edit the recipe in `scripts/make-fluoro.mjs`, then run
`node scripts/make-fluoro.mjs && npm run build`. The script prints the
contrast of each text and fill pair.

A mode can have a `syntax` object (comment, keyword, string, number and so
on). The build writes a Shiki theme from it, `fluorokit/shiki/ink-dark.json`
for example, with the mode's text color as the default and no background.

A theme can have a `tiles` object. Each entry becomes `--fk-tile-<name>`, a
tile fill that is the same in each mode. `tileText` becomes `--fk-tile-text`,
the text color on a tile.

## Add a theme

Copy a file in `tokens/themes/`. Each mode must define each color in the
`REQUIRED` list in `scripts/build.mjs`. `chart-4` and `chart-5` are optional.
To give a shadcn variable a value that no fluorokit color has, put it in the
mode's `shadcn` object.

## Credits

The `catppuccin` theme uses colors from [Catppuccin](https://github.com/catppuccin/catppuccin) (MIT).

Selawik is copyright Microsoft Corporation, under the SIL Open Font License
1.1 (`src/fonts/selawik/LICENSE.txt`).
