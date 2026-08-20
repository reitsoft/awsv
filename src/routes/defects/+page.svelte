<script lang="ts">
	import type { PageData } from './$types';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Search, ArrowUpRight, AlertTriangle } from 'lucide-svelte';

	let { data }: { data: PageData } = $props();

	// Such-Status
	let searchQuery = $state('');

	// Reaktive Filterung basierend auf Suchbegriff
	let filteredDefects = $derived(
		(data.defects ?? []).filter((defect) => {
			const query = searchQuery.toLowerCase();
			return (
				defect.title.toLowerCase().includes(query) ||
				defect.facilityName.toLowerCase().includes(query) ||
				defect.facilityNumber.toLowerCase().includes(query) ||
				defect.building.toLowerCase().includes(query)
			);
		})
	);
</script>

<div class="flex-1 space-y-6 p-6 pt-6 md:p-8">
	<!-- Header -->
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div class="space-y-1">
			<div class="flex items-center gap-2">
				<h1 class="text-3xl font-bold tracking-tight">Mangelliste</h1>
			</div>
			<p class="text-sm text-muted-foreground">
				Übersicht aller erfassten Mängel an den Betriebsanlagen.
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
					placeholder="Anlage, Nummer oder Mangel suchen..."
					class="pl-9"
					bind:value={searchQuery}
				/>
			</div>
			<span class="text-xs text-muted-foreground">
				{filteredDefects.length} von {data.defects.length} Mängeln
			</span>
		</Card.Header>
		<Card.Content>
			<div class="rounded-md border overflow-x-auto">
				<table class="w-full text-sm text-left">
					<thead class="bg-muted/50 text-xs uppercase text-muted-foreground border-b">
						<tr>
							<th class="p-3">Mangel</th>
							<th class="p-3">Schwere</th>
							<th class="p-3">Anlage</th>
							<th class="p-3">Standort</th>
							<th class="p-3">Gemeldet am</th>
							<th class="p-3 text-right">Aktion</th>
						</tr>
					</thead>
					<tbody class="divide-y">
						{#each filteredDefects as defect (defect.id)}
							<tr class="hover:bg-muted/50 transition-colors">
								<td class="p-3 font-medium">
									<div class="flex items-center gap-2">
										<AlertTriangle class="h-4 w-4 text-amber-500 shrink-0" />
										<span>{defect.title}</span>
									</div>
								</td>
								<td class="p-3">
									<Badge variant={defect.severity === 'EM' ? 'destructive' : 'outline'}>
										{defect.severity === 'EM' ? 'Erheblich' : 'Geringfügig'}
									</Badge>
								</td>
								<td class="p-3">
									<div class="font-medium">{defect.facilityName}</div>
									<div class="text-xs text-muted-foreground">{defect.facilityNumber}</div>
								</td>
								<td class="p-3 text-muted-foreground">{defect.building}</td>
								<td class="p-3 text-muted-foreground">{defect.reportedAt}</td>
								<td class="p-3 text-right">
									<Button variant="ghost" size="sm" href="/facilities/{defect.facilityId}" class="gap-1">
										Anlage
										<ArrowUpRight class="h-4 w-4" />
									</Button>
								</td>
							</tr>
						{:else}
							<tr>
								<td colspan="6" class="p-8 text-center text-muted-foreground">
									Keine Mängel gefunden.
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</Card.Content>
	</Card.Root>
</div>