export interface DashboardKPIs {
	totalFacilities: number;
	inspectionsThisMonth: number;
	openDefects: number;
	overdueOrUpcomingInspections: number;
}

export interface FacilitySummary {
	id: string;
	name: string;
	facilityNumber: string;
	building: string;
	hazardStage: 'A' | 'B' | 'C' | 'D';
	wgk: 'nwg' | 'awg' | 'WGK 1' | 'WGK 2' | 'WGK 3';
	nextInspectionDate: string;
	status: 'In Betrieb' | 'Vorübergehend außer Betrieb' | 'Abgebaut/Archiviert';
	openDefectsCount: number;
}

export type DefectSeverity = 'GM' | 'EM' | 'GEM';

export interface Defect {
	id: string;
	title?: string | null;
	severity?: DefectSeverity | null;
	facilityName?: string | null;
	facilityNumber?: string | null;
	/** ISO-8601 Datumsstring oder bereits formatiert, je nach Backend */
	reportedAt?: string | null;
}