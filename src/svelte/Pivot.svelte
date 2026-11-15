<script lang="ts" generics="T extends string">
	// A row of pivot headers: the selected one is solid, the rest are faint.
	// `size` picks the top-level or second-level style. Write the items in
	// lowercase by hand.
	//
	// A click points the next page-enter at the side the new item lies on, so
	// content with .fk-enter slides in from that side. The styles are in
	// fluorokit/base.css.
	import { setEnterDirection } from '../enter.js';

	let {
		items,
		value = $bindable(),
		size = 'pivot',
		disabled = [],
		scope = null
	}: {
		items: readonly T[];
		value: T;
		size?: 'pivot' | 'subpivot';
		disabled?: readonly T[];
		/** The element that holds the entering content. Default: the root element. */
		scope?: HTMLElement | null;
	} = $props();

	function select(item: T) {
		if (item === value) return;
		setEnterDirection(items, value, item, scope);
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
