import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// Ersetze dies durch deinen echten Datenbank-Aufruf
	const inspections = [
		{
			id: 'insp-1',
			facilityId: 'fac-101',
			facilityName: 'Tankanlage Nord',
			facilityNumber: 'A-101',
			building: 'Halle 3',
			hazardStage: 'C',
			dueDate: '2026-08-01',
			isOverdue: true,
			inspector: 'TÜV Süd'
		},
		{
			id: 'insp-2',
			facilityId: 'fac-103',
			facilityName: 'Lösemittellager',
			facilityNumber: 'A-103',
			building: 'Gebäude B',
			hazardStage: 'D',
			dueDate: '2026-09-15',
			isOverdue: false,
			inspector: 'DEKRA'
		}
	];

	return { inspections };
};