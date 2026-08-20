<script lang="ts">
	import type { PageData } from './$types';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Search, ArrowUpRight, Plus, Factory, Calendar } from 'lucide-svelte';

	let { data }: { data: PageData } = $props();

	// Such-Status (Svelte 5 Rune)
	let searchQuery = $state('');

	// Reaktive Filterung basierend auf Suchbegriff
	let filteredFacilities = $derived(
		(data.facilities ?? []).filter((facility) => {
			const query = searchQuery.toLowerCase();
			return (
				facility.name.toLowerCase().includes(query) ||
				facility.facilityNumber.toLowerCase().includes(query) ||
				facility.building.toLowerCase().includes(query) ||
				facility.wgk.toLowerCase().includes(query)
			);
		})
	);
</script>

<div class="flex-1 space-y-6 p-6 pt-6 md:p-8">
	<!-- Header -->
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div class="space-y-1">
			<div class="flex items-center gap-2">
				<h1 class="text-3xl font-bold tracking-tight">Anlagenübersicht</h1>
			</div>
			<p class="text-sm text-muted-foreground">
				Verwaltung und Gesamtliste aller im System erfassten AwSV-Anlagen.
			</p>
		</div>
		<div class="flex items-center gap-2">
			<Button href="/facilities/new" class="gap-2">
				<Plus class="h-4 w-4" />
				Anlage erfassen
			</Button>
		</div>
	</div>

	<!-- Filter & Tabelle Card -->
	<Card.Root>
		<Card.Header class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4">
			<div class="relative w-full sm:w-80">
				<Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
				<Input
					type="search"
					placeholder="Anlagename, Nr., Standort..."
					class="pl-9"
					bind:value={searchQuery}
				/>
			</div>
			<span class="text-xs text-muted-foreground">
				{filteredFacilities.length} von {data.facilities.length} Anlagen
			</span>
		</Card.Header>
		<Card.Content>
			<div class="rounded-md border overflow-x-auto">
				<table class="w-full text-sm text-left">
					<thead class="bg-muted/50 text-xs uppercase text-muted-foreground border-b">
						<tr>
							<th class="p-3">Anlage / Nr.</th>
							<th class="p-3">Gefährdungsstufe</th>
							<th class="p-3">WGK</th>
							<th class="p-3">Standort</th>
							<th class="p-3">Offene Mängel</th>
							<th class="p-3">Nächste Prüfung</th>
							<th class="p-3 text-right">Aktion</th>
						</tr>
					</thead>
					<tbody class="divide-y">
						{#each filteredFacilities as facility (facility.id)}
							<tr class="hover:bg-muted/50 transition-colors">
								<td class="p-3 font-medium">
									<div class="flex items-center gap-2">
										<Factory class="h-4 w-4 text-muted-foreground shrink-0" />
										<div>
											<div>{facility.name}</div>
											<div class="text-xs font-normal text-muted-foreground">{facility.facilityNumber}</div>
										</div>
									</div>
								</td>
								<td class="p-3">
									<Badge variant="outline">Stufe {facility.hazardStage}</Badge>
								</td>
								<td class="p-3 text-muted-foreground">{facility.wgk}</td>
								<td class="p-3 text-muted-foreground">{facility.building}</td>
								<td class="p-3">
									{#if facility.openDefectsCount > 0}
										<Badge variant="destructive" class="text-xs">
											{facility.openDefectsCount} Mängel
										</Badge>
									{:else}
										<span class="text-xs text-muted-foreground">Keine</span>
									{/if}
								</td>
								<td class="p-3">
									<div class="flex items-center gap-1.5 text-muted-foreground">
										<Calendar class="h-3.5 w-3.5" />
										<span>{facility.nextInspection}</span>
									</div>
								</td>
								<td class="p-3 text-right">
									<Button variant="ghost" size="sm" href="/facilities/{facility.id}" class="gap-1">
										Details
										<ArrowUpRight class="h-4 w-4" />
									</Button>
								</td>
							</tr>
						{:else}
							<tr>
								<td colspan="7" class="p-8 text-center text-muted-foreground">
									Keine Anlagen gefunden.
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</Card.Content>
	</Card.Root>
</div>