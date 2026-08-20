<script lang="ts">
	import type { PageData } from './$types';
	import { fly } from 'svelte/transition';
	import * as Card from '$lib/components/ui/card';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import {
		ArrowLeft,
		Factory,
		Calendar,
		AlertTriangle,
		Pencil,
		Building,
		ShieldAlert,
		History,
		CheckCircle2,
		Image as ImageIcon,
		ChevronLeft,
		ChevronRight,
		Upload,
		Plus
	} from 'lucide-svelte';

	interface FacilityImage {
		id: string;
		url: string;
		caption: string;
	}

	interface Defect {
		id: string;
		title: string;
		severity: 'EM' | 'GM';
		status: 'OFFEN' | 'IN_BEARBEITUNG' | 'BEHOBEN';
		reportedAt: string;
	}

	let { data }: { data: PageData } = $props();
	const facility = $derived(data.facility);

	// Carousel State (Svelte 5 Runes)
	let currentImageIndex = $state(0);
	let direction = $state<1 | -1>(1);

	let images = $state<FacilityImage[]>(
		facility.images ?? [
			{
				id: '1',
				url: 'https://picsum.photos/800/400?random=1',
				caption: 'Typenschild & Auffangwanne'
			},
			{
				id: '2',
				url: 'https://picsum.photos/800/400?random=2',
				caption: 'Leckanzeiger Bedienfeld'
			},
			{ id: '3', url: 'https://picsum.photos/800/400?random=3', caption: 'Gesamtansicht Halle 3' }
		]
	);

	function nextImage() {
		direction = 1;
		currentImageIndex = (currentImageIndex + 1) % images.length;
	}

	function prevImage() {
		direction = -1;
		currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
	}

	// Upload Dialog State
	let isUploadOpen = $state(false);
	let selectedFile = $state<File | null>(null);
	let captionInput = $state('');

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files && target.files[0]) {
			selectedFile = target.files[0];
		}
	}

	function handleUpload(event: SubmitEvent) {
		event.preventDefault();
		if (!selectedFile) return;

		const newImage: FacilityImage = {
			id: Date.now().toString(),
			url: URL.createObjectURL(selectedFile),
			caption: captionInput || selectedFile.name
		};

		images = [...images, newImage];
		currentImageIndex = images.length - 1;

		selectedFile = null;
		captionInput = '';
		isUploadOpen = false;
	}

	const openDefects = $derived(
		facility.defects.filter((d: Defect) => d.status === 'OFFEN' || d.status === 'IN_BEARBEITUNG')
	);
</script>

<div class="flex-1 space-y-6 p-6 pt-6 md:p-8">
	<!-- Header / Navigation -->
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div class="space-y-1">
			<div class="flex items-center gap-2">
				<Button variant="ghost" size="icon" href="/facilities" class="h-8 w-8">
					<ArrowLeft class="h-4 w-4" />
				</Button>
				<h1 class="text-3xl font-bold tracking-tight">{facility.name}</h1>
				<Badge variant="outline" class="text-sm">{facility.facilityNumber}</Badge>
			</div>
			<p class="pl-10 text-sm text-muted-foreground">
				Standort: {facility.building} • Betreiber: {facility.operator}
			</p>
		</div>

		<div class="flex items-center gap-2">
			<Button variant="outline" href="/facilities/{facility.id}/edit" class="gap-2">
				<Pencil class="h-4 w-4" />
				Bearbeiten
			</Button>
		</div>
	</div>

	<!-- KENNZAHLEN / QUICK-STATS GRID -->
	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between pb-2">
				<Card.Title class="text-sm font-medium text-muted-foreground">AwSV Stufe</Card.Title>
				<ShieldAlert class="h-4 w-4 text-muted-foreground" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">Stufe {facility.hazardStage}</div>
				<p class="mt-1 text-xs text-muted-foreground">{facility.wgk} • {facility.volume} m³</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between pb-2">
				<Card.Title class="text-sm font-medium text-muted-foreground">Nächste Prüfung</Card.Title>
				<Calendar class="h-4 w-4 text-muted-foreground" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">{facility.nextInspection}</div>
				<p class="mt-1 text-xs text-muted-foreground">Prüfer: {facility.inspector}</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between pb-2">
				<Card.Title class="text-sm font-medium text-muted-foreground">Offene Mängel</Card.Title>
				<AlertTriangle class="h-4 w-4 text-amber-500" />
			</Card.Header>
			<Card.Content>
				<div
					class="text-2xl font-bold {openDefects.length > 0
						? 'text-amber-600 dark:text-amber-400'
						: ''}"
				>
					{openDefects.length}
				</div>
				<p class="mt-1 text-xs text-muted-foreground">
					{openDefects.length > 0 ? 'Handlungsbedarf vorhanden' : 'Keine Mängel vermerkt'}
				</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between pb-2">
				<Card.Title class="text-sm font-medium text-muted-foreground">Status</Card.Title>
				<Factory class="h-4 w-4 text-muted-foreground" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
					{facility.status}
				</div>
				<p class="mt-1 text-xs text-muted-foreground">Seit {facility.commissionedAt}</p>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- MAIN CONTENT GRID -->
	<div class="grid gap-6 md:grid-cols-3">
		<!-- LINKS: Stammdaten & Anlagenfotos (2 Spalten breit) -->
		<div class="space-y-6 md:col-span-2">
			<!-- Stammdaten Card -->
			<Card.Root>
				<Card.Header>
					<Card.Title class="flex items-center gap-2">
						<Building class="h-5 w-5 text-muted-foreground" />
						Anlagenstammdaten
					</Card.Title>
				</Card.Header>
				<Card.Content class="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
					<div class="space-y-1">
						<span class="text-xs text-muted-foreground">Anlagenbezeichnung</span>
						<p class="font-medium">{facility.name}</p>
					</div>
					<div class="space-y-1">
						<span class="text-xs text-muted-foreground">Anlagennummer</span>
						<p class="font-medium">{facility.facilityNumber}</p>
					</div>
					<div class="space-y-1">
						<span class="text-xs text-muted-foreground">Lagermedium / Stoff</span>
						<p class="font-medium">{facility.substance}</p>
					</div>
					<div class="space-y-1">
						<span class="text-xs text-muted-foreground">Volumen / Kapazität</span>
						<p class="font-medium">{facility.volume} m³</p>
					</div>
					<div class="space-y-1">
						<span class="text-xs text-muted-foreground">Wassergefährdungsklasse</span>
						<p class="font-medium">{facility.wgk}</p>
					</div>
					<div class="space-y-1">
						<span class="text-xs text-muted-foreground">Gefährdungsstufe (AwSV)</span>
						<p class="font-medium">Stufe {facility.hazardStage}</p>
					</div>
					<div class="space-y-1">
						<span class="text-xs text-muted-foreground">Standort / Halle</span>
						<p class="font-medium">{facility.building}</p>
					</div>
					<div class="space-y-1">
						<span class="text-xs text-muted-foreground">Erstinbetriebnahme</span>
						<p class="font-medium">{facility.commissionedAt}</p>
					</div>
				</Card.Content>
			</Card.Root>

			<!-- BILDERGALERIE CAROUSEL CARD -->
			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between pb-3">
					<div class="space-y-1">
						<Card.Title class="flex items-center gap-2 text-lg">
							<ImageIcon class="h-5 w-5 text-muted-foreground" />
							Anlagenfotos & Dokumentation
						</Card.Title>
						<Card.Description>
							Fotos zur Visuellen Inspektion und Zustandserfassung.
						</Card.Description>
					</div>

					<Button onclick={() => (isUploadOpen = true)} size="sm" class="gap-2">
						<Plus class="h-4 w-4" />
						Bild hochladen
					</Button>
				</Card.Header>

				<Card.Content>
					{#if images.length > 0}
						<div
							class="relative aspect-video max-h-160 w-full overflow-hidden rounded-lg border bg-black/5"
						>
							{#key currentImageIndex}
								<img
									in:fly={{ x: direction * 300, duration: 200 }}
									out:fly={{ x: direction * -300, duration: 200 }}
									src={images[currentImageIndex].url}
									alt={images[currentImageIndex].caption}
									class="absolute inset-0 h-full w-full object-cover"
								/>
							{/key}

							<div
								class="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 text-white"
							>
								<p class="text-xs font-medium">{images[currentImageIndex].caption}</p>
								<p class="text-[10px] text-white/70">
									Bild {currentImageIndex + 1} von {images.length}
								</p>
							</div>

							{#if images.length > 1}
								<Button
									variant="secondary"
									size="icon"
									class="absolute left-2 top-1/2 z-20 h-7 w-7 -translate-y-1/2 rounded-full opacity-80 shadow hover:opacity-100"
									onclick={prevImage}
								>
									<ChevronLeft class="h-3.5 w-3.5" />
								</Button>

								<Button
									variant="secondary"
									size="icon"
									class="absolute right-2 top-1/2 z-20 h-7 w-7 -translate-y-1/2 rounded-full opacity-80 shadow hover:opacity-100"
									onclick={nextImage}
								>
									<ChevronRight class="h-3.5 w-3.5" />
								</Button>
							{/if}
						</div>
					{:else}
						<div
							class="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground"
						>
							Noch keine Bilder für diese Anlage vorhanden.
						</div>
					{/if}
				</Card.Content>
			</Card.Root>
		</div>

		<!-- RECHTS: Mängelliste & Prüfhistorie (1 Spalte breit) -->
		<div class="space-y-6">
			<!-- Mängelliste -->
			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between">
					<div>
						<Card.Title class="flex items-center gap-2 text-base">
							<AlertTriangle class="h-4 w-4 text-amber-500" />
							Mängelliste ({facility.defects.length})
						</Card.Title>
					</div>
				</Card.Header>
				<Card.Content class="space-y-3">
					{#each facility.defects as defect (defect.id)}
						<div class="space-y-2 rounded-lg border bg-background p-3 text-sm">
							<div class="flex items-start justify-between gap-2">
								<span class="text-xs font-medium leading-tight">{defect.title}</span>
								<Badge
									variant={defect.severity === 'EM' ? 'destructive' : 'outline'}
									class="shrink-0 text-[10px]"
								>
									{defect.severity === 'EM' ? 'Erheblich' : 'Gering'}
								</Badge>
							</div>
							<div
								class="flex items-center justify-between border-t pt-1 text-[11px] text-muted-foreground"
							>
								<span>Gemeldet: {defect.reportedAt}</span>
								<span
									class={defect.status === 'OFFEN'
										? 'font-semibold text-amber-600'
										: 'text-emerald-600'}
								>
									{defect.status}
								</span>
							</div>
						</div>
					{:else}
						<div class="p-6 text-center text-xs text-muted-foreground">
							Keine Mängel zu dieser Anlage registriert.
						</div>
					{/each}
				</Card.Content>
			</Card.Root>

			<!-- Historie der Prüfungen -->
			<Card.Root>
				<Card.Header>
					<Card.Title class="flex items-center gap-2 text-base">
						<History class="h-4 w-4 text-muted-foreground" />
						Prüfhistorie
					</Card.Title>
					<Card.Description class="text-xs">
						Vergangene Sachverständigenprüfungen.
					</Card.Description>
				</Card.Header>
				<Card.Content>
					<div class="divide-y rounded-md border">
						{#each facility.inspectionsHistory as history (history.id)}
							<div class="space-y-1 p-3 text-sm">
								<div class="flex items-center justify-between">
									<div class="flex items-center gap-1.5 font-medium text-xs">
										<CheckCircle2 class="h-3.5 w-3.5 text-emerald-500 shrink-0" />
										<span>{history.type}</span>
									</div>
									<span class="font-mono text-[11px] text-muted-foreground">{history.date}</span>
								</div>
								<p class="text-[11px] text-muted-foreground pl-5">
									Prüfer: {history.inspector}<br />Ergebnis: {history.result}
								</p>
							</div>
						{:else}
							<p class="p-4 text-center text-xs text-muted-foreground">Keine Historie vorhanden.</p>
						{/each}
					</div>
				</Card.Content>
			</Card.Root>
		</div>
	</div>
</div>

<!-- POPUP DIALOG FÜR BILD-UPLOAD (Shadcn UI) -->
<Dialog.Root bind:open={isUploadOpen}>
	<Dialog.Content class="max-w-xs p-4 sm:max-w-sm">
		<Dialog.Header class="space-y-1">
			<Dialog.Title class="flex items-center gap-2 text-base">
				<Upload class="h-4 w-4" />
				Foto hochladen
			</Dialog.Title>
			<Dialog.Description class="text-xs">
				Wähle eine Bilddatei für die Dokumentation aus.
			</Dialog.Description>
		</Dialog.Header>

		<form onsubmit={handleUpload} class="space-y-3 pt-2">
			<div class="space-y-1.5">
				<Label for="picture" class="text-xs">Bilddatei</Label>
				<Input
					id="picture"
					type="file"
					accept="image/*"
					required
					class="h-9 cursor-pointer text-xs"
					onchange={handleFileSelect}
				/>
			</div>

			<div class="space-y-1.5">
				<Label for="caption" class="text-xs">Beschreibung (Optional)</Label>
				<Input
					id="caption"
					type="text"
					placeholder="z. B. Leckage Wanne Süd"
					class="h-8 text-xs"
					bind:value={captionInput}
				/>
			</div>

			<Dialog.Footer class="flex-row justify-end gap-2 pt-2">
				<Button
					type="button"
					variant="outline"
					size="sm"
					class="h-8 text-xs"
					onclick={() => (isUploadOpen = false)}
				>
					Abbrechen
				</Button>
				<Button type="submit" size="sm" class="h-8 text-xs" disabled={!selectedFile}>
					Hochladen
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>