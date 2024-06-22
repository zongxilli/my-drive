// value of FileType should keep consistent to fileTypes & schemaFileTypes in convex/schema.ts

export enum FileType {
	pdf = 'pdf',
	image = 'image',
	csv = 'csv',
}

export type FileTypeUnion = (typeof FileType)[keyof typeof FileType];

export enum FileTimeFilter {
	today = 'Today',
	last3Days = 'Last 3 days',
	last7Days = 'Last 7 days',
	last30Days = 'Last 30 days',
	lastYear = 'Last year',
}

export type FileTimeFilterUnion =
	(typeof FileTimeFilter)[keyof typeof FileTimeFilter];

export const getDateDiffByFileTimeFilter = (filter: FileTimeFilterUnion) => {
	switch (filter) {
		case FileTimeFilter.today:
			return 1;
		case FileTimeFilter.last3Days:
			return 3;
		case FileTimeFilter.last7Days:
			return 7;
		case FileTimeFilter.last30Days:
			return 30;
		case FileTimeFilter.lastYear:
			return 365;
	}
};
