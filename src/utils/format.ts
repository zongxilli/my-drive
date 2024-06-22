import {
	FileTimeFilterUnion,
	getDateDiffByFileTimeFilter,
} from '@/app/types/file';

export const formatUtils = {
	formatDate: (timestamp: number) => {
		const date = new Date(timestamp);

		const options: Intl.DateTimeFormatOptions = {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		};

		const formattedDate = date.toLocaleDateString('en-US', options);

		return formattedDate;
	},

	isDateTimeStampWithinDate: (
		timestamp: number,
		filter: FileTimeFilterUnion
	) => {
		const diff = getDateDiffByFileTimeFilter(filter);

		const now = new Date();

		// 当前日期的时间戳
		const nowTimestamp = now.getTime();

		// 七天前的时间戳
		const sevenDaysAgoTimestamp = nowTimestamp - diff * 24 * 60 * 60 * 1000;

		// 检查给定时间戳是否在七天前之后
		return timestamp >= sevenDaysAgoTimestamp && timestamp <= nowTimestamp;
	},
};
