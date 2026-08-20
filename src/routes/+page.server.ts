import type { PageServerLoad } from './$types';
import type { DashboardKPIs, FacilitySummary } from '$lib/types/dashboard';

export const load: PageServerLoad = async () => {
	// Dummy KPI-Daten
	const kpis: DashboardKPIs = {
		totalFacilities: 42,
		inspectionsThisMonth: 3,
		openDefects: 7,
		overdueOrUpcomingInspections: 5
	};

	// Dummy Anlagen-Daten für die Übersicht
	const recentFacilities: FacilitySummary[] = [
		{
			id: '1',
			name: 'Lösungsmitteltank Nord',
			facilityNumber: 'ANL-2023-001',
			building: 'Halle A',
			hazardStage: 'C',
			wgk: 'WGK 2',
			nextInspectionDate: '2026-09-15',
			status: 'In Betrieb',
			openDefectsCount: 2
		},
		{
			id: '2',
			name: 'Hydraulikaggregat Presse 4',
			facilityNumber: 'ANL-2021-089',
			building: 'Halle B',
			hazardStage: 'B',
			wgk: 'WGK 1',
			nextInspectionDate: '2026-08-28',
			status: 'In Betrieb',
			openDefectsCount: 0
		},
		{
			id: '3',
			name: 'Altöl-Sammelbehälter',
			facilityNumber: 'BEH-2019-012',
			building: 'Außenbereich West',
			hazardStage: 'D',
			wgk: 'WGK 3',
			nextInspectionDate: '2026-08-10', // Überfällig
			status: 'In Betrieb',
			openDefectsCount: 4
		},
		{
			id: '4',
			name: 'Diesel-Eigenverbrauchstank',
			facilityNumber: 'ANL-2018-004',
			building: 'Fuhrpark',
			hazardStage: 'C',
			wgk: 'WGK 2',
			nextInspectionDate: '2026-11-02',
			status: 'Vorübergehend außer Betrieb',
			openDefectsCount: 1
		}
	];

	return {
		kpis,
		recentFacilities
	};
};