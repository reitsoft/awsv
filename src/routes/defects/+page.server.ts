import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// Ersetze dies durch deinen echten Datenbank-Aufruf
	const defects = [
		{
			id: 'def-1',
			title: 'Undichtigkeit am Auffangraum',
			severity: 'EM', // Erheblicher Mangel
			reportedAt: '2026-08-10',
			status: 'OFFEN',
			facilityId: 'fac-101',
			facilityName: 'Tankanlage Nord',
			facilityNumber: 'A-101',
			building: 'Halle 3'
		},
		{
			id: 'def-2',
			title: 'Mängel an der Leckanzeige',
			severity: 'GM', // Geringfügiger Mangel
			reportedAt: '2026-08-15',
			status: 'IN_BEARBEITUNG',
			facilityId: 'fac-102',
			facilityName: 'Diesel-Eigenverbrauch',
			facilityNumber: 'A-102',
			building: 'Außenbereich'
		}
	];

	return { defects };
};