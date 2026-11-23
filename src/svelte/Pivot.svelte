<script lang="ts" generics="T extends string">
	// A row of pivot headers: the selected one is solid, the rest are faint.
	// `size` picks the top-level or second-level style. Write the items in
	// lowercase by hand.
	//
	// A click points the next page-enter at the side the new item lies on, so
	// content with .fk-enter slides in from that side. The styles are in
	// fluorokit/base.css.
	//
	// Give `leaving` the element that holds the current page, and the old page
	// leaves first (`exit`: slide or turnstile), then `value` changes.
	import { setEnterDirection } from '../enter.js';
	import { leave } from '../motion.js';

	let {
		items,
		value = $bindable(),
		size = 'pivot',
		disabled = [],
		scope = null,
		leaving = null,
		exit = 'slide'
	}: {
		items: readonly T[];
		value: T;
		size?: 'pivot' | 'subpivot';
		disabled?: readonly T[];
		/** The element that holds the entering content. Default: the root element. */
		scope?: HTMLElement | null;
		/** The element that holds the current page. It plays the exit before the change. */
		leaving?: HTMLElement | null;
		exit?: 'slide' | 'turnstile';
	} = $props();

	// True while the old page plays its exit. A click in that time does nothing.
	let busy = false;

	async function select(item: T) {
		if (item === value || busy) return;
		setEnterDirection(items, value, item, scope);
		if (leaving) {
			busy = true;
			await leave(leaving, { kind: exit });
			busy = false;
		}
		value = item;
	}
</script>

<div class="fk-pivot" class:fk-pivot-sub={size === 'subpivot'} role="tablist">
	{#each items as item (item)}
		<button
			type="button"
			role="tab"
			aria-selected={value === item}
			disabled={disabled.includes(item)}
			onclick={() => select(item)}
		>
			{item}
		</button>
	{/each}
</div>
