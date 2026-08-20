import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const facilityId = params.id;

	// Ersetze dies durch deinen echten Datenbank-Aufruf (z. B. Prisma, Drizzle, Supabase)
	// Beispieldaten passend zur ID
	const facility = {
		id: facilityId,
		facilityNumber: 'A-101',
		name: 'Tankanlage Nord',
		building: 'Halle 3',
		operator: 'Mustermann Logistik GmbH',
		substance: 'Heizöl EL',
		volume: 45.0, // in m³
		wgk: 'WGK 2', // Wassergefährdungsklasse
		hazardStage: 'C', // Gefährdungsstufe nach AwSV
		status: 'AKTIV',
		commissionedAt: '2018-04-12',
		lastInspection: '2023-09-10',
		nextInspection: '2026-09-15',
		inspector: 'TÜV Süd',
		
		// Verknüpfte Mängel zu dieser Anlage
		defects: [
			{
				id: 'def-1',
				title: 'Undichtigkeit am Auffangraum',
				severity: 'EM', // Erheblicher Mangel
				reportedAt: '2026-08-10',
				status: 'OFFEN'
			},
			{
				id: 'def-2',
				title: 'Beschilderung leicht beschädigt',
				severity: 'GM', // Geringfügiger Mangel
				reportedAt: '2025-11-02',
				status: 'BEHOBEN'
			}
		],

		// Historie der Prüfungen
		inspectionsHistory: [
			{
				id: 'insp-2023',
				date: '2023-09-10',
				type: 'Wiederkehrende Prüfung',
				inspector: 'TÜV Süd',
				result: 'Ohne erhebliche Mängel'
			},
			{
				id: 'insp-2018',
				date: '2018-04-12',
				type: 'Inbetriebnahme-Prüfung',
				inspector: 'TÜV Süd',
				result: 'Mängelfrei'
			}
		]
	};

	if (!facility) {
		throw error(404, 'Anlage nicht gefunden');
	}

	return { facility };
};