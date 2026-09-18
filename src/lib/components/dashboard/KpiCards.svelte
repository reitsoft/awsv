<script lang="ts">
    import type { PageData } from './$types';
	import AnlagenKarte from '$lib/components/dashboard/AnlagenKarte.svelte';
	import * as Card from '$lib/components/ui/card';
	import { Calendar, TriangleAlert, Clock } from '@lucide/svelte';

    let { data }: { data: PageData } = $props();
</script>

<!-- 4 KPI-Karten Grid -->
<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
	<!-- Karte 1: Anlagen gesamt -->
	<AnlagenKarte stages={{ A: 158, B: 41, C: 3, D: 2 }} />

	<!-- Karte 2: Prüfungen pro Monat -->
	<Card.Root>
		<Card.Header class="flex flex-row items-center justify-between pb-2">
			<Card.Title class="text-sm font-medium text-muted-foreground">
				Prüfungen diesen Monat
			</Card.Title>
			<Calendar class="h-4 w-4 text-muted-foreground" />
		</Card.Header>
		<Card.Content>
			<div class="text-2xl font-bold">{data.kpis.inspectionsThisMonth}</div>
			<p class="mt-1 text-xs text-muted-foreground">Anstehend im laufenden Monat</p>
		</Card.Content>
	</Card.Root>

	<!-- Karte 3: Offene Mängel -->
	<Card.Root>
		<Card.Header class="flex flex-row items-center justify-between pb-2">
			<Card.Title class="text-sm font-medium text-muted-foreground">Offene Mängel</Card.Title>
			<TriangleAlert class="h-4 w-4 text-amber-500" />
		</Card.Header>
		<Card.Content>
			<div class="text-2xl font-bold text-amber-600 dark:text-amber-400">
				{data.kpis.openDefects}
			</div>
			<p class="mt-1 text-xs text-muted-foreground">In Bearbeitung / Unbehiben</p>
		</Card.Content>
	</Card.Root>

	<!-- Karte 4: Fristen-Warnung / Überfällig -->
	<Card.Root>
		<Card.Header class="flex flex-row items-center justify-between pb-2">
			<Card.Title class="text-sm font-medium text-muted-foreground">Fristen-Warnungen</Card.Title>
			<Clock class="h-4 w-4 text-destructive" />
		</Card.Header>
		<Card.Content>
			<div class="text-2xl font-bold text-destructive">
				{data.kpis.overdueOrUpcomingInspections}
			</div>
			<p class="mt-1 text-xs text-muted-foreground">Überfällig oder in &lt; 8 Wochen</p>
		</Card.Content>
	</Card.Root>
</div>
