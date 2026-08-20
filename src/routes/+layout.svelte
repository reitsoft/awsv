<script lang="ts">
	import './layout.css';
	import { page } from '$app/stores';
	import { resolve } from '$app/paths';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import { Separator } from '$lib/components/ui/separator';
	import { LayoutDashboard, SearchCheck, Triangle, List } from '@lucide/svelte';

	// Logo aus src/lib/assets importieren
	import logoUrl from '$lib/assets/AMCR.svg';

	let { children } = $props();

	// Navigationselemente für die AwSV App
	const navItems = [
		{
			title: 'Dashboard',
			url: '/',
			icon: LayoutDashboard
		},
		{
			title: 'Anlagen',
			url: '/facilities',
			icon: Triangle
		},
		{
			title: 'Mangelliste',
			url: '/defects',
			icon: List
		},
		{
			title: 'Prüfungen',
			url: '/inspections',
			icon: SearchCheck
		}
	];
</script>

<Sidebar.Provider>
	<!-- Shadcn App Sidebar -->
	<Sidebar.Root collapsible="icon">
		<!-- Header mit App-Logo & Titel -->
		<Sidebar.Header>
			<Sidebar.Menu>
				<Sidebar.MenuItem>
					<Sidebar.MenuButton
						size="lg"
						class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
					>
						<!-- Amcor Logo Bereich -->
						<div
							class="flex aspect-square size-14 items-center justify-center rounded-lg bg-background p-1"
						>
							<img src={logoUrl} alt="Amcor Logo" class="h-full w-full object-contain" />
						</div>
						<div class="grid flex-1 text-left text-sm leading-tight">
							<span class="truncate font-semibold">AwSV Manager</span>
							<span class="truncate text-xs text-muted-foreground">Amcor Singen</span>
						</div>
					</Sidebar.MenuButton>
				</Sidebar.MenuItem>
			</Sidebar.Menu>
		</Sidebar.Header>

		<!-- Content / Hauptmenü -->
		<Sidebar.Content>
			<Sidebar.Group>
				<Sidebar.GroupLabel>Navigation</Sidebar.GroupLabel>
				<Sidebar.Menu>
					{#each navItems as item (item.title)}
						{@const isActive = $page.url.pathname === item.url}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton {isActive}>
								{#snippet child({ props })}
									<a href={resolve(item.url)} {...props}>
										<item.icon />
										<span>{item.title}</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					{/each}
				</Sidebar.Menu>
			</Sidebar.Group>
		</Sidebar.Content>

		<!-- Footer mit Status-Hinweis -->
		<Sidebar.Footer>
			<Sidebar.Menu>
				<Sidebar.MenuItem>
					<div class="p-2 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
						<p class="font-medium text-sidebar-foreground">Revisionssicher</p>
						<p>AwSV Compliance v1.0</p>
					</div>
				</Sidebar.MenuItem>
			</Sidebar.Menu>
		</Sidebar.Footer>

		<Sidebar.Rail />
	</Sidebar.Root>

	<!-- Haupt-Inhaltsbereich / Main Content Area -->
	<Sidebar.Inset>
		<!-- Top Bar mit Sidebar Trigger & Breadcrumbs/Titel -->
		<header
			class="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12"
		>
			<div class="flex items-center gap-2">
				<!-- Inbuilt Sidebar Collapse Trigger -->
				<Sidebar.Trigger class="-ml-1" />
				<Separator orientation="vertical" class="mr-2 h-4" />
				<span class="text-sm font-medium text-muted-foreground"
					>Anlagenverwaltung & Mängeldokumentation</span
				>
			</div>
			<div class="hidden text-xs text-muted-foreground sm:block">
				Angemeldet als: <span class="font-semibold text-foreground">Umweltbeauftragter</span>
			</div>
		</header>

		<!-- Seiteninhalt der aktuellen Route (z.B. Dashboard) -->
		<main class="flex-1 overflow-y-auto">
			{@render children()}
		</main>
	</Sidebar.Inset>
</Sidebar.Provider>
