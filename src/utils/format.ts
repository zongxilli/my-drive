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
};
