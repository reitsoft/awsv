<script lang="ts">
	import * as Card from '$lib/components/ui/card';

	interface Props {
		totalActive?: number;
		stages?: {
			A: number;
			B: number;
			C: number;
			D: number;
		};
	}
	let {
		totalActive = 204,
		stages = { A: 158, B: 41, C: 3, D: 2 }
	}: Props = $props();

	// AwSV Gefährdungsstufen Farb-Palette (gemäß Theme/Status)
	const COLORS = {
		A: '#10b981', // Emerald / Grün
		B: '#0ea5e9', // Sky / Cyan
		C: '#f59e0b', // Amber / Orange
		D: '#ef4444' // Rose / Rot
	} as const;

	const LABELS = {
		A: 'Stufe A',
		B: 'Stufe B',
		C: 'Stufe C',
		D: 'Stufe D'
	} as const;

	let hovered = $state<'A' | 'B' | 'C' | 'D' | null>(null);

	let totalSum = $derived(stages.A + stages.B + stages.C + stages.D);

	// Berechnung der Donut-Sektoren (Ring statt Vollkreis)
	const RADIUS = 40;
	const STROKE = 14;
	const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

	let slices = $derived.by(() => {
		let offset = 0;
		const keys = ['A', 'B', 'C', 'D'] as const;
		return keys.map((key) => {
			const value = stages[key];
			const fraction = totalSum > 0 ? value / totalSum : 0;
			const dash = fraction * CIRCUMFERENCE;
			const percent = Math.round(fraction * 100);
			const slice = {
				key,
				value,
				percent,
				color: COLORS[key],
				label: LABELS[key],
				dashArray: `${dash} ${CIRCUMFERENCE - dash}`,
				dashOffset: -offset
			};
			offset += dash;
			return slice;
		});
	});
</script>

<Card.Root
	class="w-full overflow-hidden border-border/60 bg-gradient-to-b from-card to-card/60 shadow-sm"
>
	<Card.Header class="flex-row items-start justify-between space-y-0 pb-0">
		<div>
			<Card.Description class="text-xs font-medium tracking-wide text-muted-foreground uppercase"
				>Aktive Anlagen</Card.Description
			>
		</div>
	</Card.Header>

	<Card.Content class="pt-0">
		<div class="flex items-center gap-8">
			<!-- Donut Chart mit zentriertem Total -->
			<div class="relative shrink-0">
				<svg viewBox="0 0 100 100" class="h-40 w-40 -rotate-90">
					<circle
						cx="50"
						cy="50"
						r={RADIUS}
						fill="none"
						stroke="currentColor"
						class="text-muted/20"
						stroke-width={STROKE}
					/>
					{#each slices as slice}
						{#if slice.value > 0}
							<circle
								cx="50"
								cy="50"
								r={RADIUS}
								fill="none"
								stroke={slice.color}
								stroke-width={STROKE}
								stroke-dasharray={slice.dashArray}
								stroke-dashoffset={slice.dashOffset}
								stroke-linecap="butt"
								class="transition-[stroke-width,opacity] duration-200 ease-out"
								style="opacity: {hovered === null || hovered === slice.key ? 1 : 0.35}; stroke-width: {hovered ===
								slice.key
									? STROKE + 3
									: STROKE}; transform-origin: 50px 50px;"
								onmouseenter={() => (hovered = slice.key)}
								onmouseleave={() => (hovered = null)}
								role="img"
							/>
						{/if}
					{/each}
				</svg>
				<div class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
					<span class="text-2xl font-bold tabular-nums leading-none">
						{hovered ? stages[hovered] : totalSum}
					</span>
					<span class="mt-1 text-[11px] font-medium text-muted-foreground">
						{hovered ? `Stufe ${hovered}` : 'Gesamt'}
					</span>
				</div>
			</div>

			<!-- Legende -->
			<div class="min-w-0 flex-1 space-y-3">
				{#each slices as slice}
					<button
						type="button"
						class="group flex w-full items-center gap-3 rounded-md py-0.5 text-left transition-opacity"
						style="opacity: {hovered === null || hovered === slice.key ? 1 : 0.5}"
						onmouseenter={() => (hovered = slice.key)}
						onmouseleave={() => (hovered = null)}
					>
						<span
							class="h-2 w-2 shrink-0 rounded-full"
							style="background-color: {slice.color}"
						></span>
						<span class="flex-1 truncate text-sm font-medium text-muted-foreground">
							{slice.label}
						</span>
						<span class="w-8 shrink-0 text-right text-sm font-bold tabular-nums text-foreground">
							{slice.value}
						</span>
					</button>
				{/each}
			</div>
		</div>
	</Card.Content>
</Card.Root>