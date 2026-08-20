<script lang="ts">
	import type { PageData } from './$types';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Search, ArrowUpRight, Calendar } from 'lucide-svelte';

	let { data }: { data: PageData } = $props();

	// Such-Status
	let searchQuery = $state('');

	// Reaktive Filterung basierend auf Suchbegriff
	let filteredInspections = $derived(
		(data.inspections ?? []).filter((inspection) => {
			const query = searchQuery.toLowerCase();
			return (
				inspection.facilityName.toLowerCase().includes(query) ||
				inspection.facilityNumber.toLowerCase().includes(query) ||
				inspection.building.toLowerCase().includes(query) ||
				inspection.inspector.toLowerCase().includes(query)
			);
		})
	);
</script>

<div class="flex-1 space-y-6 p-6 pt-6 md:p-8">
	<!-- Header -->
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div class="space-y-1">
			<div class="flex items-center gap-2">
				<h1 class="text-3xl font-bold tracking-tight">Prüffristen & Termine</h1>
			</div>
			<p class="text-sm text-muted-foreground">
				Übersicht über anstehende und überfällige Anlagenprüfungen nach AwSV.
			</p>
		</div>
	</div>

	<!-- Filter & Tabelle Card -->
	<Card.Root>
		<Card.Header class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4">
			<div class="relative w-full sm:w-80">
				<Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
				<Input
					type="search"
					placeholder="Anlage, Nummer oder Prüfer suchen..."
					class="pl-9"
					bind:value={searchQuery}
				/>
			</div>
			<span class="text-xs text-muted-foreground">
				{filteredInspections.length} von {data.inspections.length} Terminen
			</span>
		</Card.Header>
		<Card.Content>
			<div class="rounded-md border overflow-x-auto">
				<table class="w-full text-sm text-left">
					<thead class="bg-muted/50 text-xs uppercase text-muted-foreground border-b">
						<tr>
							<th class="p-3">Anlage</th>
							<th class="p-3">Gefährdungsstufe</th>
							<th class="p-3">Standort</th>
							<th class="p-3">Fälligkeitsdatum</th>
							<th class="p-3">Prüforganisation</th>
							<th class="p-3 text-right">Aktion</th>
						</tr>
					</thead>
					<tbody class="divide-y">
						{#each filteredInspections as inspection (inspection.id)}
							<tr class="hover:bg-muted/50 transition-colors">
								<td class="p-3 font-medium">
									<div>{inspection.facilityName}</div>
									<div class="text-xs text-muted-foreground">{inspection.facilityNumber}</div>
								</td>
								<td class="p-3">
									<Badge variant="outline">Stufe {inspection.hazardStage}</Badge>
								</td>
								<td class="p-3 text-muted-foreground">{inspection.building}</td>
								<td class="p-3">
									<div class="flex items-center gap-1.5 font-medium">
										<Calendar class="h-3.5 w-3.5 text-muted-foreground" />
										<span class={inspection.isOverdue ? 'text-destructive font-bold' : ''}>
											{inspection.dueDate}
										</span>
										{#if inspection.isOverdue}
											<Badge variant="destructive" class="text-[10px] ml-1">Überfällig</Badge>
										{/if}
									</div>
								</td>
								<td class="p-3 text-muted-foreground">{inspection.inspector}</td>
								<td class="p-3 text-right">
									<Button variant="ghost" size="sm" href="/facilities/{inspection.facilityId}" class="gap-1">
										Anlage
										<ArrowUpRight class="h-4 w-4" />
									</Button>
								</td>
							</tr>
						{:else}
							<tr>
								<td colspan="6" class="p-8 text-center text-muted-foreground">
									Keine Prüffristen gefunden.
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</Card.Content>
	</Card.Root>
</div>