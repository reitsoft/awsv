<script lang="ts">
	import type { PageData } from './$types';
	import KpiCards from '$lib/components/dashboard/KpiCards.svelte';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Plus, ArrowUpRight, AlertTriangle, Calendar, ChevronRight } from 'lucide-svelte';

	// Svelte 5 Runes Props
	let { data }: { data: PageData } = $props();
</script>

<div class="flex-1 space-y-6 p-6 pt-6 md:p-8">
	<!-- Header / Aktionen -->
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">AwSV Dashboard</h1>
			<p class="text-sm text-muted-foreground">
				Überblick über Anlagen, Prüffristen und offene Mängel.
			</p>
		</div>
		<div class="flex items-center gap-2">
			<Button href="/facilities/new" class="gap-2">
				<Plus class="h-4 w-4" />
				Anlage erfassen
			</Button>
		</div>
	</div>

	<!-- KPI Karten -->
	<KpiCards {data} />

	<!-- Zweispaltiges Layout: Mängel & Prüffristen -->
	<div class="grid gap-6 grid-cols-1 lg:grid-cols-2">
		
		<!-- Spalte 1: Offene Mängel -->
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between pb-3">
				<div class="space-y-1">
					<Card.Title class="flex items-center gap-2 text-lg">
						<AlertTriangle class="h-5 w-5 text-amber-500" />
						Offene Mängel
					</Card.Title>
					<Card.Description>
						Aktuell unbehobene oder in Bearbeitung befindliche Mängel.
					</Card.Description>
				</div>
				<Button variant="ghost" size="sm" href="/defects" class="gap-1 text-xs">
					Alle anzeigen
					<ChevronRight class="h-4 w-4" />
				</Button>
			</Card.Header>
			<Card.Content class="pt-0">
				<div class="divide-y rounded-md border bg-background">
					{#each (data.defects ?? []).slice(0, 10) as defect (defect.id)}
						<div class="flex items-center justify-between p-3.5 transition-colors hover:bg-muted/50">
							<div class="space-y-1 pr-2">
								<div class="flex items-center gap-2 font-medium text-sm">
									<span>{defect.title ?? defect.facilityName}</span>
									<Badge 
										variant={defect.severity === 'GM' ? 'destructive' : 'outline'} 
										class="text-[10px] px-1.5 py-0"
									>
										{defect.severity ?? 'Mangel'}
									</Badge>
								</div>
								<p class="text-xs text-muted-foreground line-clamp-1">
									Anlage: {defect.facilityName ?? defect.facilityNumber} • Gemeldet: {defect.reportedAt ?? 'k.A.'}
								</p>
							</div>
							<Button variant="ghost" size="icon" class="h-8 w-8 shrink-0" href="/defects/{defect.id}">
								<ArrowUpRight class="h-4 w-4" />
							</Button>
						</div>
					{:else}
						<div class="p-6 text-center text-sm text-muted-foreground">
							Keine offenen Mängel vorhanden.
						</div>
					{/each}
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Spalte 2: Überfällige / Anstehende Prüfungen -->
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between pb-3">
				<div class="space-y-1">
					<Card.Title class="flex items-center gap-2 text-lg">
						<Calendar class="h-5 w-5 text-destructive" />
						Anstehende & Überfällige Prüfungen
					</Card.Title>
					<Card.Description>
						Fristen, die in den nächsten Wochen fällig oder überschritten sind.
					</Card.Description>
				</div>
				<Button variant="ghost" size="sm" href="/inspections" class="gap-1 text-xs">
					Alle anzeigen
					<ChevronRight class="h-4 w-4" />
				</Button>
			</Card.Header>
			<Card.Content class="pt-0">
				<div class="divide-y rounded-md border bg-background">
					{#each (data.upcomingInspections ?? []).slice(0, 10) as inspection (inspection.id)}
						<div class="flex items-center justify-between p-3.5 transition-colors hover:bg-muted/50">
							<div class="space-y-1 pr-2">
								<div class="flex items-center gap-2 font-medium text-sm">
									<span>{inspection.facilityName}</span>
									<Badge 
										variant={inspection.isOverdue ? 'destructive' : 'secondary'} 
										class="text-[10px] px-1.5 py-0"
									>
										{inspection.isOverdue ? 'Überfällig' : 'Fällig'}
									</Badge>
								</div>
								<p class="text-xs text-muted-foreground line-clamp-1">
									{inspection.facilityNumber} • Fällig am: <span class="font-medium text-foreground">{inspection.dueDate}</span>
								</p>
							</div>
							<Button variant="ghost" size="icon" class="h-8 w-8 shrink-0" href="/facilities/{inspection.facilityId}">
								<ArrowUpRight class="h-4 w-4" />
							</Button>
						</div>
					{:else}
						<div class="p-6 text-center text-sm text-muted-foreground">
							Keine anstehenden Prüffristen vorhanden.
						</div>
					{/each}
				</div>
			</Card.Content>
		</Card.Root>

	</div>
</div>