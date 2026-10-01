<script lang="ts">
  // /facilities +page.svelte
  import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, X } from 'lucide-svelte';
  import rawData from '$lib/data/data.json';

  import * as Table from '$lib/components/ui/table';
  import { Badge } from '$lib/components/ui/badge';

  // ---------------------------------------------------------------------------
  // Typen
  // ---------------------------------------------------------------------------
  interface AnlageDetails {
    ID: string | number;
    Name: string;
    Gebäude?: string | null;
    Gebäude_Clean?: string | null;
    Standort?: string | null;
    Status?: string | null;
    Medium?: string | null;
    Gefährdungstyp?: string | null;
    WGK?: string | number | null;
    Volumen_Gesamt?: number | null;
    [key: string]: unknown; // weitere Felder aus der JSON tolerieren
  }

  interface TreeNode {
    name?: string;
    details?: AnlageDetails;
    children?: TreeNode[];
  }

  // Header-Spalten als Konstante
  const HEADERS = ['ID', 'Name', 'Gebäude', 'Standort', 'Status', 'Medium', 'Gefährdungstyp'] as const;
  const COLSPAN = HEADERS.length + 1; // + Spalte "Volumen / WGK"

  // ---------------------------------------------------------------------------
  // Daten flachklopfen (rekursiv mit Akkumulator -> kein O(n²))
  // ---------------------------------------------------------------------------
  function flattenData(node: TreeNode, acc: AnlageDetails[] = []): AnlageDetails[] {
    if (node.details) acc.push(node.details);
    if (Array.isArray(node.children)) {
      for (const child of node.children) flattenData(child, acc);
    }
    return acc;
  }

  const root = rawData as unknown as TreeNode;
  const baseData: AnlageDetails[] = flattenData(root);

  const numberFormat = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2 });

  // ---------------------------------------------------------------------------
  // Volltextsuche
  // ---------------------------------------------------------------------------
  // Normalisiert für die Suche: Kleinschreibung, ohne Akzente/Umlaut-Diakritika
  // (ä -> a, ü -> u ...), ß -> ss. So findet "gebaude" auch "Gebäude".
  function normalize(value: string): string {
    return value
      .toLowerCase()
      .replace(/ß/g, 'ss')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  // Suchtext einer Anlage: ALLE skalaren Felder aus der JSON (nicht nur die
  // angezeigten Spalten), plus das formatierte Volumen ("1.234,5").
  function buildSearchText(item: AnlageDetails): string {
    const parts: string[] = [];
    for (const value of Object.values(item)) {
      if (value == null) continue;
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        parts.push(String(value));
      }
    }
    if (item.Volumen_Gesamt != null) parts.push(numberFormat.format(item.Volumen_Gesamt));
    return normalize(parts.join(' '));
  }

  // Einmalig vorberechnet (parallel zu baseData), nicht bei jedem Tastendruck.
  const searchIndex: string[] = baseData.map(buildSearchText);

  let query = $state('');

  // Mehrere Suchbegriffe (durch Leerzeichen getrennt) müssen ALLE vorkommen (UND),
  // in beliebiger Reihenfolge und in beliebigen Feldern.
  const tokens = $derived(normalize(query).split(/\s+/).filter(Boolean));

  const filteredData = $derived.by(() => {
    if (tokens.length === 0) return baseData;
    const result: AnlageDetails[] = [];
    for (let i = 0; i < baseData.length; i++) {
      const text = searchIndex[i];
      if (tokens.every((t) => text.includes(t))) result.push(baseData[i]);
    }
    return result;
  });

  const isFiltered = $derived(tokens.length > 0);

  function onSearchInput(e: Event & { currentTarget: HTMLInputElement }): void {
    query = e.currentTarget.value;
    anchor = 0; // bei neuer Suche zurück auf Seite 1
  }

  function clearSearch(): void {
    query = '';
    anchor = 0;
  }

  function onSearchKeydown(e: KeyboardEvent): void {
    if (e.key === 'Escape' && query) {
      e.preventDefault();
      clearSearch();
    }
  }

  // ---------------------------------------------------------------------------
  // Konstanten
  // ---------------------------------------------------------------------------
  const rowHeight = 48; // = h-12, MUSS zur Zeilenhöhe im Markup passen
  const headerHeight = 48; // = h-12 der Kopfzeile
  const containerBorder = 2; // 1px Rahmen oben + unten
  const fallbackPageSize = 10; // bis der Container gemessen wurde (SSR / erster Render)

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  let innerHeight = $state(0); // <svelte:window bind:innerHeight>
  let headerH = $state(0); // bind:clientHeight am Seitenkopf
  let footerH = $state(0); // bind:clientHeight an der Pagination-Leiste
  let wrapperEl = $state<HTMLDivElement>();
  let containerHeight = $state(0); // Höhe des Tabellenbereichs in px (berechnet, layoutunabhängig)

  // Platz unter der Tabelle, der nicht vom Footer stammt:
  // Root-Padding unten (16) + gap (16) + evtl. Padding/Chrome deines Layouts.
  const bottomReserve = 32;
  const minContainerHeight = 192;

  // Tabellenbereich = Viewport-Höhe - Abstand von oben - Footer - Reserve.
  // Hängt nicht von der Höhenkette des Layouts ab.
  $effect(() => {
    void innerHeight;
    void headerH;
    void footerH;
    if (!wrapperEl || innerHeight === 0) return;

    const docTop = wrapperEl.getBoundingClientRect().top + window.scrollY;
    containerHeight = Math.max(minContainerHeight, Math.floor(innerHeight - docTop - footerH - bottomReserve));
  });

  // Index der ersten sichtbaren Zeile. So bleibt die Position stabil,
  // wenn sich die Seitengröße durch Resize ändert.
  let anchor = $state(0);

  // ---------------------------------------------------------------------------
  // Pagination (abgeleitete Werte)
  // ---------------------------------------------------------------------------
  const pageSize = $derived(
    containerHeight > 0
      ? Math.max(1, Math.floor((containerHeight - headerHeight - containerBorder) / rowHeight))
      : fallbackPageSize
  );

  const totalPages = $derived(Math.max(1, Math.ceil(filteredData.length / pageSize)));
  const page = $derived(Math.min(Math.floor(anchor / pageSize), totalPages - 1)); // 0-basiert

  const pageItems = $derived(filteredData.slice(page * pageSize, (page + 1) * pageSize));
  const firstRow = $derived(filteredData.length === 0 ? 0 : page * pageSize + 1);
  const lastRow = $derived(Math.min((page + 1) * pageSize, filteredData.length));

  const isFirstPage = $derived(page <= 0);
  const isLastPage = $derived(page >= totalPages - 1);

  function goTo(p: number): void {
    anchor = Math.min(Math.max(0, p), totalPages - 1) * pageSize;
  }

  const navButton =
    'inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';
</script>

<svelte:window bind:innerHeight />

<!-- Die Höhe des Tabellenbereichs wird im Script aus dem Viewport berechnet, daher kein h-full nötig -->
<div class="flex w-full flex-col gap-4 p-4">
  <header
    bind:clientHeight={headerH}
    class="flex flex-none flex-col justify-between gap-4 sm:flex-row sm:items-center"
  >
    <div>
      <h1 class="text-3xl font-bold tracking-tight text-foreground">Anlagenübersicht</h1>
      <p class="mt-1 text-sm text-muted-foreground">
        Quelle: <span class="font-semibold text-foreground">{root.name || 'System'}</span>
      </p>
    </div>

    <div class="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
      <div class="relative">
        <Search
          class="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          oninput={onSearchInput}
          onkeydown={onSearchKeydown}
          placeholder="Anlagen durchsuchen…"
          aria-label="Anlagen durchsuchen"
          autocomplete="off"
          spellcheck="false"
          class="h-9 w-64 rounded-md border border-border bg-card pl-8 pr-8 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-search-cancel-button]:hidden"
        />
        {#if query}
          <button
            type="button"
            onclick={clearSearch}
            aria-label="Suche zurücksetzen"
            class="absolute right-1.5 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X class="h-4 w-4" />
          </button>
        {/if}
      </div>

      <div class="rounded-lg border border-border bg-card px-3 py-2 shadow-sm">
        {isFiltered ? 'Treffer' : 'Anlagen gesamt'}:
        <strong class="text-foreground">{filteredData.length}</strong>{isFiltered ? ` / ${baseData.length}` : ''}
      </div>
      <div class="rounded-lg border border-border bg-card px-3 py-2 shadow-sm">
        Zeilen pro Seite: <strong class="text-primary">{pageSize}</strong>
      </div>
    </div>
  </header>

  <!--
    Wrapper mit berechneter Höhe. Der Inhalt liegt absolut darin und beeinflusst
    die Höhe daher nicht -> keine Rückkopplung zwischen Zeilenanzahl und Höhe.
  -->
  <div
    bind:this={wrapperEl}
    class="relative min-w-0 flex-none"
    style:height="{containerHeight > 0 ? containerHeight : minContainerHeight}px"
  >
    <div
      class="absolute inset-0 overflow-x-auto overflow-y-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm"
    >
      <table class="w-full min-w-[960px] table-fixed border-separate border-spacing-0 text-sm">
        <colgroup>
          <col class="w-24" />
          <col class="w-[20%]" />
          <col class="w-[12%]" />
          <col class="w-[12%]" />
          <col class="w-32" />
          <col class="w-[15%]" />
          <col class="w-36" />
          <col class="w-36" />
        </colgroup>

        <Table.Header class="bg-card">
          <Table.Row class="hover:bg-transparent">
            {#each HEADERS as label (label)}
              <Table.Head class="h-12 border-b border-border bg-card">{label}</Table.Head>
            {/each}
            <Table.Head class="h-12 border-b border-border bg-card text-right">Volumen / WGK</Table.Head>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {#if pageItems.length === 0}
            <Table.Row>
              <Table.Cell colspan={COLSPAN} class="h-24 text-center text-muted-foreground">
                {#if isFiltered}
                  Keine Treffer für „{query.trim()}“.
                  <button type="button" class="ml-1 underline underline-offset-2 hover:text-foreground" onclick={clearSearch}>
                    Suche zurücksetzen
                  </button>
                {:else}
                  Keine Daten vorhanden.
                {/if}
              </Table.Cell>
            </Table.Row>
          {:else}
            {#each pageItems as item (item.ID)}
              <Table.Row class="transition-colors hover:bg-muted/50">
                <!-- ID -->
                <Table.Cell class="h-12 truncate border-b border-border/60 py-0 font-mono text-xs text-muted-foreground">
                  {item.ID}
                </Table.Cell>

                <!-- Name -->
                <Table.Cell class="h-12 truncate border-b border-border/60 py-0 font-semibold text-foreground" title={item.Name}>
                  {item.Name}
                </Table.Cell>

                <!-- Gebäude -->
                <Table.Cell class="h-12 truncate border-b border-border/60 py-0">
                  {item.Gebäude || item.Gebäude_Clean || '-'}
                </Table.Cell>

                <!-- Standort -->
                <Table.Cell class="h-12 truncate border-b border-border/60 py-0">
                  {item.Standort || '-'}
                </Table.Cell>

                <!-- Status -->
                <Table.Cell class="h-12 border-b border-border/60 py-0">
                  {#if item.Status === 'In Betrieb'}
                    <Badge variant="outline" class="border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      {item.Status}
                    </Badge>
                  {:else}
                    <Badge variant="outline" class="border-destructive/20 bg-destructive/10 text-destructive">
                      {item.Status || 'Unbekannt'}
                    </Badge>
                  {/if}
                </Table.Cell>

                <!-- Medium -->
                <Table.Cell class="h-12 truncate border-b border-border/60 py-0" title={item.Medium ?? ''}>
                  {item.Medium || '-'}
                </Table.Cell>

                <!-- Gefährdungstyp -->
                <Table.Cell class="h-12 truncate border-b border-border/60 py-0" title={item.Gefährdungstyp ?? ''}>
                  {item.Gefährdungstyp || '-'}
                </Table.Cell>

                <!-- Volumen & WGK -->
                <Table.Cell class="h-12 border-b border-border/60 py-0 text-right font-mono text-xs">
                  <div class="flex items-center justify-end gap-1.5">
                    {#if item.WGK != null}
                      <span class="rounded border border-border/50 bg-muted px-1.5 py-0.5 font-sans text-[10px] font-medium text-muted-foreground">
                        WGK {item.WGK}
                      </span>
                    {/if}
                    <span>
                      {item.Volumen_Gesamt != null ? `${numberFormat.format(item.Volumen_Gesamt)} m³` : '-'}
                    </span>
                  </div>
                </Table.Cell>
              </Table.Row>
            {/each}
          {/if}
        </Table.Body>
      </table>
    </div>
  </div>

  <!-- Pagination -->
  <footer
    bind:clientHeight={footerH}
    class="flex flex-none flex-col items-center justify-between gap-3 text-xs text-muted-foreground sm:flex-row"
  >
    <span aria-live="polite">
      {firstRow}–{lastRow} von {filteredData.length}
    </span>

    <nav class="flex items-center gap-1" aria-label="Seitennavigation">
      <button type="button" class={navButton} disabled={isFirstPage} onclick={() => goTo(0)} aria-label="Erste Seite">
        <ChevronsLeft class="h-4 w-4" />
      </button>
      <button type="button" class={navButton} disabled={isFirstPage} onclick={() => goTo(page - 1)} aria-label="Vorherige Seite">
        <ChevronLeft class="h-4 w-4" />
      </button>

      <span class="min-w-24 px-2 text-center text-foreground">
        Seite {page + 1} / {totalPages}
      </span>

      <button type="button" class={navButton} disabled={isLastPage} onclick={() => goTo(page + 1)} aria-label="Nächste Seite">
        <ChevronRight class="h-4 w-4" />
      </button>
      <button type="button" class={navButton} disabled={isLastPage} onclick={() => goTo(totalPages - 1)} aria-label="Letzte Seite">
        <ChevronsRight class="h-4 w-4" />
      </button>
    </nav>
  </footer>
</div>