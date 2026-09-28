<script lang="ts">
	import { hierarchy, treemap, type HierarchyRectangularNode } from 'd3-hierarchy';
	import { scaleOrdinal } from 'd3-scale';
	import data from './data.json';

	type NodeData = {
		name: string;
		value?: number;
		children?: NodeData[];
	};
	type Node = HierarchyRectangularNode<NodeData>;

	let width = $state(800);
	let height = $state(600);

	// treemap() mutiert dasselbe Objekt und ergänzt x0/x1/y0/y1, daher ist der Cast unproblematisch.
	const rootNode = hierarchy<NodeData>(data as NodeData) as Node;

	let idCounter = 0;
	rootNode.each((node) => {
		node.id = `${nodePath(node)}_${idCounter++}`;
	});

	rootNode
		.sum((d) => {
			if (d.children?.length) return 0;
			return Math.sqrt(Math.max(d.value ?? 1, 1));
		})
		.sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

	function nodePath(node: { ancestors(): { data: NodeData }[] }): string {
		return node
			.ancestors()
			.map((d) => d.data.name)
			.reverse()
			.join('/');
	}

	let currentFocus = $state<Node>(rootNode);

	const colorScale = scaleOrdinal(['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']);

	let layoutNodes = $derived.by(() => {
		const w = Math.max(width, 100);
		const h = Math.max(height, 100);

		return treemap<NodeData>()
			.size([w, h])
			.paddingTop(22)
			.paddingInner(4)
			.paddingOuter(4)
			.round(true)(rootNode)
			.descendants();
	});

	// Nur der Fokusknoten und seine direkten Kinder werden gezeichnet.
	let tiles = $derived.by(() => {
		const nodes = layoutNodes; // Layout zuerst, dann transformieren
		const focus = currentFocus;
		const kx = width / (focus.x1 - focus.x0);
		const ky = height / (focus.y1 - focus.y0);

		return nodes
			.filter((n) => n === focus || n.parent === focus)
			.map((node) => ({
				node,
				isFocus: node === focus,
				rect: {
					x: (node.x0 - focus.x0) * kx,
					y: (node.y0 - focus.y0) * ky,
					width: (node.x1 - node.x0) * kx,
					height: (node.y1 - node.y0) * ky
				}
			}))
			.filter((t) => t.rect.width > 2 && t.rect.height > 2);
	});

	let breadcrumbs = $derived(currentFocus.ancestors().reverse() as Node[]);
	let detailNode = $derived(currentFocus.children ? null : currentFocus);

	function zoomOut() {
		if (currentFocus.parent) currentFocus = currentFocus.parent as Node;
	}

	function resetZoom() {
		currentFocus = rootNode;
	}

	function handleRectClick(node: Node, event: MouseEvent | KeyboardEvent) {
		event.stopPropagation();
		if (node !== currentFocus) currentFocus = node;
		else zoomOut();
	}

	function formatValue(val: unknown): string {
		if (typeof val === 'object' && val !== null) {
			return JSON.stringify(val, null, 2);
		}
		return String(val);
	}

	function pluralAnlagenteile(count: number): string {
		return `${count} ${count === 1 ? 'Anlagenteil' : 'Anlagenteile'}`;
	}

	const EXCLUDE_KEYS = new Set([
		'children',
		'details',
		'Details',
		'name',
		'Name',
		'value',
		'Value',
		'Doku',
		'Dokumente'
	]);

	// Schlüssel, die bereits in Kopfzeile oder Kennzahlen angezeigt werden
	const HEADER_KEYS = new Set([
		'Status',
		'ID',
		'Gebäude',
		'Standort',
		'Gefährdungstyp',
		'Volumen_Gesamt'
	]);

	function getCleanData(nodeData: Record<string, unknown>): Record<string, unknown> {
		let combined: Record<string, unknown> = { ...nodeData };

		const rawDetails = nodeData.details ?? nodeData.Details;

		if (typeof rawDetails === 'string') {
			try {
				const parsed: unknown = JSON.parse(rawDetails);
				if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
					combined = { ...combined, ...(parsed as Record<string, unknown>) };
				}
			} catch {
				/* Ignorieren falls kein valides JSON */
			}
		} else if (rawDetails && typeof rawDetails === 'object' && !Array.isArray(rawDetails)) {
			combined = { ...combined, ...(rawDetails as Record<string, unknown>) };
		}

		const result: Record<string, unknown> = {};
		for (const [key, val] of Object.entries(combined)) {
			if (!EXCLUDE_KEYS.has(key) && val !== null && val !== undefined && val !== '') {
				result[key] = val;
			}
		}

		return result;
	}
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && zoomOut()} />

<div class="flex h-full w-full flex-col gap-4 p-6">
	<!-- Breadcrumb Header -->
	<div class="flex flex-wrap items-center justify-between gap-4">
		<nav aria-label="Breadcrumb" class="flex items-center text-sm">
			<ol class="flex flex-wrap items-center gap-1.5 text-muted-foreground">
				{#each breadcrumbs as node, index (node.id)}
					<li class="inline-flex items-center gap-1.5">
						{#if index > 0}
							<span class="text-slate-500 opacity-60">/</span>
						{/if}

						{#if index === breadcrumbs.length - 1}
							<span class="font-semibold text-foreground" aria-current="page">
								{node.data.name}
							</span>
						{:else}
							<button
								type="button"
								onclick={() => (currentFocus = node)}
								class="transition-colors hover:text-foreground hover:underline"
							>
								{node.data.name}
							</button>
						{/if}
					</li>
				{/each}
			</ol>
		</nav>

		{#if currentFocus.parent}
			<button
				type="button"
				onclick={zoomOut}
				class="rounded-md border bg-background px-3 py-1.5 text-xs font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
			>
				← Eine Ebene hoch
			</button>
		{/if}
	</div>

	<!-- Treemap Container -->
	<div
		bind:clientWidth={width}
		bind:clientHeight={height}
		class="relative h-[calc(100vh-180px)] w-full overflow-hidden rounded-xl bg-slate-900/5 dark:bg-slate-900"
	>
		<svg {width} {height} viewBox="0 0 {width} {height}" class="h-full w-full">
			<!-- Klick auf freie Fläche: zurück zur Wurzel. Tastatur-Alternativen: Breadcrumb, Button, Escape. -->
			<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
			<rect {width} {height} fill="transparent" onclick={resetZoom} />

			{#each tiles as { node, rect, isFocus } (node.id)}
				<g
					transform="translate({rect.x},{rect.y})"
					role="button"
					tabindex="0"
					aria-label={node.children
						? `${node.data.name}, ${pluralAnlagenteile(node.children.length)}`
						: node.data.name}
					onclick={(e) => handleRectClick(node, e)}
					onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
							handleRectClick(node, e);
						}
					}}
					class="tile group cursor-pointer outline-none"
					class:is-focus={isFocus}
				>
					<rect
						width={rect.width}
						height={rect.height}
						fill={colorScale(node.depth.toString())}
						fill-opacity={isFocus ? 0.15 : 0.85}
						stroke="#ffffff"
						stroke-width={isFocus ? '2' : '1'}
						rx="6"
						class="group-focus-visible:stroke-yellow-300 group-focus-visible:stroke-[3]"
					/>

					{#if !isFocus && rect.width > 40 && rect.height > 25}
						<text
							x="12"
							y="24"
							font-size="13"
							font-weight="bold"
							fill="#ffffff"
							class="pointer-events-none select-none"
						>
							{node.data.name}
						</text>

						{#if node.children && rect.height > 45}
							<text
								x="12"
								y="42"
								font-size="11"
								fill="#e2e8f0"
								class="pointer-events-none select-none"
							>
								{pluralAnlagenteile(node.children.length)}
							</text>
						{/if}
					{/if}
				</g>
			{/each}
		</svg>

		<!-- Detailansicht bei fokussiertem Blattknoten (HTML-Overlay statt foreignObject) -->
		{#if detailNode}
			{@const details = getCleanData(detailNode.data)}

			<div class="absolute inset-0 p-4">
				<div
					role="region"
					aria-label="Details zu {detailNode.data.name}"
					class="flex h-full w-full flex-col gap-5 overflow-hidden rounded-xl border border-slate-800 bg-slate-950/95 p-6 text-white shadow-2xl backdrop-blur-md"
				>
					<!-- Header -->
					<div class="flex items-start justify-between border-b border-slate-800 pb-4">
						<div>
							<div class="flex items-center gap-2">
								<span
									class="rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold tracking-wider text-emerald-400 uppercase"
								>
									Anlagenteil
								</span>
								{#if details.Status}
									<span
										class="rounded border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[11px] font-semibold text-blue-400"
									>
										{formatValue(details.Status)}
									</span>
								{/if}
							</div>
							<h2 class="mt-2 text-2xl font-bold tracking-tight text-white">
								{detailNode.data.name}
							</h2>
						</div>

						<div class="text-right font-mono text-xs text-slate-400">
							<div>
								ID:
								<span class="text-slate-200">
									{formatValue(details.ID ?? nodePath(detailNode))}
								</span>
							</div>
							{#if details['Equipment-Nr. Anlage']}
								<div class="mt-0.5">
									Eq.-Nr:
									<span class="text-slate-200">{formatValue(details['Equipment-Nr. Anlage'])}</span>
								</div>
							{/if}
						</div>
					</div>

					<!-- Kennzahlen -->
					<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
						<div class="rounded-lg border border-slate-800/80 bg-slate-900/80 p-3">
							<span class="text-[11px] font-medium text-slate-400">Gebäude</span>
							<p class="mt-1 font-semibold text-slate-100">{formatValue(details.Gebäude ?? '-')}</p>
						</div>
						<div class="rounded-lg border border-slate-800/80 bg-slate-900/80 p-3">
							<span class="text-[11px] font-medium text-slate-400">Standort</span>
							<p class="mt-1 font-semibold text-slate-100">{formatValue(details.Standort ?? '-')}</p>
						</div>
						<div class="rounded-lg border border-slate-800/80 bg-slate-900/80 p-3">
							<span class="text-[11px] font-medium text-slate-400">Gefährdungstyp</span>
							<p class="mt-1 font-semibold text-amber-400">
								{formatValue(details.Gefährdungstyp ?? '-')}
							</p>
						</div>
						<div class="rounded-lg border border-slate-800/80 bg-slate-900/80 p-3">
							<span class="text-[11px] font-medium text-slate-400">Volumen Gesamt</span>
							<p class="mt-1 font-mono font-semibold text-emerald-400">
								{formatValue(details.Volumen_Gesamt ?? detailNode.data.value ?? '-')}
							</p>
						</div>
					</div>

					<!-- Details Grid -->
					<div class="flex-1 overflow-y-auto pr-1">
						<h3 class="mb-3 text-xs font-semibold tracking-wider text-slate-400 uppercase">
							Spezifikationen & Eigenschaften
						</h3>

						<dl class="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
							{#each Object.entries(details) as [key, val] (key)}
								{#if !HEADER_KEYS.has(key)}
									<div
										class="flex flex-col justify-between rounded-lg border border-slate-800/50 bg-slate-900/50 p-2.5 transition-colors hover:border-slate-700/60"
									>
										<dt class="text-[11px] font-medium text-slate-400">{key}</dt>
										<dd class="mt-1 font-mono text-xs font-semibold break-words text-slate-200">
											{formatValue(val)}
										</dd>
									</div>
								{/if}
							{/each}
						</dl>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.tile rect {
		transition: fill-opacity 200ms ease-out;
	}
	.tile:not(.is-focus):hover > rect {
		fill-opacity: 1;
	}
</style>