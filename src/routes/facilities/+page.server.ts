import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// Ersetze dies durch deinen echten Datenbank-Aufruf
	const facilities = [
		{
			id: 'fac-101',
			facilityNumber: 'A-101',
			name: 'Tankanlage Nord',
			building: 'Halle 3',
			wgk: 'WGK 2',
			hazardStage: 'C',
			openDefectsCount: 2,
			nextInspection: '2026-09-15'
		},
		{
			id: 'fac-102',
			facilityNumber: 'A-102',
			name: 'Diesel-Eigenverbrauch',
			building: 'Außenbereich',
			wgk: 'WGK 2',
			hazardStage: 'B',
			openDefectsCount: 0,
			nextInspection: '2027-03-10'
		},
		{
			id: 'fac-103',
			facilityNumber: 'A-103',
			name: 'Lösemittellager',
			building: 'Gebäude B',
			wgk: 'WGK 3',
			hazardStage: 'D',
			openDefectsCount: 1,
			nextInspection: '2026-08-01'
		}
	];

	return { facilities };
};