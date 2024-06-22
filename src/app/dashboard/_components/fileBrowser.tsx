'use client';

import { useOrganization, useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';

import Image from 'next/image';
import {
	AlignJustify,
	CalendarRange,
	File,
	HomeIcon,
	LaptopMinimal,
	LayoutGrid,
	Loader2,
	Star,
	Trash,
	UserRoundSearch,
	X,
} from 'lucide-react';

import emptyPlaceholder from '../../../../public/emptyPlaceholder.svg';
import emptySearchResultPlaceholder from '../../../../public/emptySearchResultPlaceholder.svg';
import emptyStarredPlaceholder from '../../../../public/emptyStarredPlaceholder.svg';
import emptyTrashPlaceholder from '../../../../public/emptyTrashPlaceholder.svg';
import notSignedIn from '../../../../public/notSignedInPlaceholder.svg';
import { ReactNode, useCallback, useMemo, useState } from 'react';
import useDebouncedState from '@/hooks/useDebounceState';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import SearchBar from '../_components/searchBar';
import FileCard from '../_components/fileCard';
import { api } from '../../../../convex/_generated/api';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { DropdownMenu } from '@/components/shared';
import { IoImages } from 'react-icons/io5';
import { MdPictureAsPdf } from 'react-icons/md';
import { LuText } from 'react-icons/lu';
import {
	FileTimeFilter,
	FileTimeFilterUnion,
	FileType,
} from '@/app/types/file';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Option } from '@/components/shared/dropdown';
import { useUserIdentity } from '@/hooks';
import { UserIdentity } from '@/hooks/useUserIdentity';
import { formatUtils } from '@/utils/format';
import { useRouter } from 'next/router';

type FileBrowserProps = {
	starredView?: boolean;
	trashView?: boolean;
};

export default function FileBrowser({
	starredView = false,
	trashView = false,
}: FileBrowserProps) {
	const organization = useOrganization();
	const user = useUser();

	const isStarredView = starredView;
	const isTrashView = trashView;

	const [listView, setListView] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const debouncedSearchQuery = useDebouncedState(searchQuery);

	const [fileTypeFilter, setFileTypeFilter] = useState('');
	const [fileUserFilter, setFileUserFilter] = useState('');
	const [fileTimeFilter, setFileTimeFilter] = useState('');
	const noFilter =
		fileTypeFilter === '' && fileUserFilter === '' && fileTimeFilter === '';

	const { status, userId, orgId } = useUserIdentity();

	const getQuery = () => {
		if (!userId && !orgId) return 'skip';
		if (orgId) return { orgId: orgId };
		return { orgId: userId! };
	};
	const files = useQuery(api.files.getFiles, getQuery());
	const isLoading = files === undefined;
	const organizationUserBasicInfos = useQuery(
		api.organizations.getOrganizationUserBasicInfos,
		orgId ? { orgId: orgId } : 'skip'
	);

	const filterSearchQueryFunction = useCallback(
		(item: string) => {
			if (debouncedSearchQuery === '') return true;
			const normalizedFilter = debouncedSearchQuery
				.toLowerCase()
				.trimStart();
			const a = item.toLowerCase().trim();
			return a.includes(normalizedFilter);
		},
		[debouncedSearchQuery]
	);

	const filterFileTypeFunction = useCallback(
		(type: 'image' | 'pdf' | 'csv') => {
			if (!fileTypeFilter) return true;

			return type === fileTypeFilter;
		},
		[fileTypeFilter]
	);

	const filterFileUserFunction = useCallback(
		(id: string) => {
			if (!fileUserFilter) return true;

			return id === fileUserFilter;
		},
		[fileUserFilter]
	);

	const filterFileTimeFunction = useCallback(
		(timestamp: number) => {
			if (!fileTimeFilter) return true;

			return formatUtils.isDateTimeStampWithinDate(
				timestamp,
				fileTimeFilter as FileTimeFilterUnion
			);
		},
		[fileTimeFilter]
	);

	const filteredFiles = useMemo(() => {
		if (!files) return [];

		const filtered = files.filter(
			(file) =>
				filterSearchQueryFunction(file.name) &&
				filterFileTypeFunction(file.type) &&
				filterFileUserFunction(file.userId) &&
				filterFileTimeFunction(file._creationTime)
		);

		if (isStarredView) {
			return filtered.filter((file) => file.isStarred);
		}

		if (isTrashView) {
			return filtered.filter((file) => file.movedToTrash);
		}

		return filtered.filter((file) => !file.movedToTrash);
	}, [
		files,
		isStarredView,
		isTrashView,
		filterSearchQueryFunction,
		filterFileTypeFunction,
		filterFileUserFunction,
		filterFileTimeFunction,
	]);

	const renderFiles = () => {
		if (status === UserIdentity.notSignedIn)
			return (
				<div className='h-[70dvh] flex flex-col items-center justify-center gap-8'>
					<Image
						priority
						alt='empty search result placeholder'
						width={300}
						height={300}
						src={notSignedIn}
					/>
					Sign in to view your drive
				</div>
			);

		if (isLoading) {
			return (
				<div className='h-[70dvh] flex flex-col items-center justify-center gap-4 text-gray-400'>
					<Loader2 className='animate-spin h-20 w-20' />
					Loading files...
				</div>
			);
		}

		if (
			(searchQuery !== '' || fileTypeFilter !== '') &&
			filteredFiles.length === 0
		) {
			let label = `No results found for ${searchQuery}`;
			if (!searchQuery) label = `No ${fileTypeFilter} file found`;

			return (
				<div className='h-[70dvh] flex flex-col items-center justify-center gap-8'>
					<Image
						priority
						alt='empty search result placeholder'
						width={300}
						height={300}
						src={emptySearchResultPlaceholder}
					/>
					{label}
				</div>
			);
		}

		if (isStarredView && filteredFiles.length === 0) {
			return (
				<div className='h-[70dvh] flex flex-col items-center justify-center gap-8'>
					<Image
						priority
						alt='empty search result placeholder'
						width={300}
						height={300}
						src={emptyStarredPlaceholder}
					/>
					You do not have any starred files
				</div>
			);
		}

		if (isTrashView && filteredFiles.length === 0) {
			return (
				<div className='h-[70dvh] flex flex-col items-center justify-center gap-8'>
					<Image
						priority
						alt='empty search result placeholder'
						width={300}
						height={300}
						src={emptyTrashPlaceholder}
					/>
					You do not have any files in trash
				</div>
			);
		}

		if (files && files.length === 0) {
			return (
				<div className='h-[70dvh] flex flex-col items-center justify-center gap-8'>
					<Image
						priority
						alt='empty folder placeholder'
						width={300}
						height={300}
						src={emptyPlaceholder}
					/>
					Your drive is empty
				</div>
			);
		}

		return (
			<div
				className={clsx('', {
					'grid grid-cols-card-auto-fill-minmax gap-6': !listView,
					'flex flex-col gap-2': listView,
				})}
			>
				{filteredFiles.map((file, idx) => (
					<FileCard key={idx} file={file} listView={listView} />
				))}
			</div>
		);
	};

	const renderSwitchButton = () => {
		return (
			<div className='flex rounded-full border border-gray-300 border-solid shadow'>
				<Button
					disabled={isLoading}
					onClick={() => setListView(true)}
					className={clsx(
						'h-8 w-12 flex items-center rounded-l-full bg-google-white hover:bg-google-lightBlue',
						{
							'bg-google-blue': listView,
						}
					)}
				>
					<AlignJustify className='w-4 h-4 text-black' />
				</Button>
				<Button
					disabled={isLoading}
					onClick={() => setListView(false)}
					className={clsx(
						'h-8 w-12 flex items-center rounded-r-full bg-google-white hover:bg-google-lightBlue',
						{
							'bg-google-blue': !listView,
						}
					)}
				>
					<LayoutGrid className='w-4 h-4 text-black' />
				</Button>
			</div>
		);
	};

	const renderFilterTypeButton = () => {
		const options = [
			{
				value: FileType.image,
				searchValue: FileType.image,
				label: (
					<div className='flex items-center gap-2'>
						<IoImages className='h-4 w-4 flex-shrink-0 text-blue-600' />
						Image
					</div>
				),
			},
			{
				value: FileType.pdf,
				searchValue: FileType.pdf,
				label: (
					<div className='flex items-center gap-2'>
						<MdPictureAsPdf className=' h-4 w-4 flex-shrink-0 text-red-600' />
						PDF
					</div>
				),
			},
			{
				value: FileType.csv,
				searchValue: FileType.csv,
				label: (
					<div className='flex items-center gap-2'>
						<LuText className=' h-4 w-4 flex-shrink-0 text-gray-600' />
						CSV
					</div>
				),
			},
		];

		const placeholder = (
			<div className='flex items-center gap-2'>
				<File className='w-4 h-4' />
				Type
			</div>
		);

		return (
			<DropdownMenu
				disabled={isLoading}
				options={options}
				value={fileTypeFilter}
				setValue={setFileTypeFilter}
				placeholder={placeholder}
			/>
		);
	};

	const renderFilterUserButton = () => {
		let options: Option[] = [];
		if (organizationUserBasicInfos) {
			options = Object.values(organizationUserBasicInfos).map((info) => ({
				value: info.userId,
				searchValue: info.name,
				label: (
					<div className='w-full min-w-0 flex items-center gap-2'>
						<Avatar className='w-4 h-4'>
							<AvatarImage src={info.image} />
							<AvatarFallback>{info.name}</AvatarFallback>
						</Avatar>
						<div className='text-ellipsis whitespace-nowrap overflow-hidden min-w-0 '>
							{info.name}
						</div>
					</div>
				),
			}));
		}

		const placeholder = (
			<div className='flex items-center gap-2'>
				<UserRoundSearch className='w-4 h-4' />
				People
			</div>
		);

		return (
			<DropdownMenu
				disabled={isLoading || status === UserIdentity.individual}
				options={options}
				value={fileUserFilter}
				setValue={setFileUserFilter}
				placeholder={placeholder}
			/>
		);
	};

	const renderFilterTimeButton = () => {
		const options = [
			{
				value: FileTimeFilter.today,
				searchValue: FileTimeFilter.today,
				label: FileTimeFilter.today,
			},
			{
				value: FileTimeFilter.last3Days,
				searchValue: FileTimeFilter.last3Days,
				label: FileTimeFilter.last3Days,
			},
			{
				value: FileTimeFilter.last7Days,
				searchValue: FileTimeFilter.last7Days,
				label: FileTimeFilter.last7Days,
			},
			{
				value: FileTimeFilter.last30Days,
				searchValue: FileTimeFilter.last30Days,
				label: FileTimeFilter.last30Days,
			},
			{
				value: FileTimeFilter.lastYear,
				searchValue: FileTimeFilter.lastYear,
				label: FileTimeFilter.lastYear,
			},
		];

		const placeholder = (
			<div className='flex items-center gap-2'>
				<CalendarRange className='w-4 h-4' />
				Created
			</div>
		);

		return (
			<DropdownMenu
				noFilterBar
				disabled={isLoading}
				options={options}
				value={fileTimeFilter}
				setValue={setFileTimeFilter}
				placeholder={placeholder}
			/>
		);
	};

	const renderResetFilterButton = () => {
		return (
			<Button
				variant='outline'
				className={clsx(
					'h-8 w-26 justify-between rounded-full shadow',
					{
						hidden: noFilter,
					}
				)}
				onClick={() => {
					setFileTypeFilter('');
					setFileUserFilter('');
					setFileTimeFilter('');
				}}
				disabled={isLoading}
			>
				Clear filters
			</Button>
		);
	};

	const renderActionsBar = () => {
		return (
			<>
				<div className='flex items-center gap-4'>
					{renderFilterTypeButton()}
					{renderFilterUserButton()}
					{renderFilterTimeButton()}
					{renderResetFilterButton()}
				</div>
				<div>{renderSwitchButton()}</div>
			</>
		);
	};

	const renderSearchBar = () => {
		return (
			<SearchBar
				disabled={isLoading}
				searchQuery={searchQuery}
				setSearchQuery={setSearchQuery}
			/>
		);
	};

	const renderContent = () => {
		return (
			<div className='flex-grow h-[92dvh] mr-2 rounded-2xl overflow-hidden bg-google-white shadow-sm'>
				<div className='w-full h-full p-4 flex flex-col gap-6 box-border overflow-auto custom-scrollbar relative'>
					<div className='w-full flex justify-center items-center text-2xl pt-4'>
						Welcome to Drive
					</div>

					<div className='w-full flex justify-center items-center'>
						{renderSearchBar()}
					</div>

					<div className='w-full flex justify-between items-center sticky top-0 z-[1]'>
						{renderActionsBar()}
					</div>

					<div className='w-full'>{renderFiles()}</div>
				</div>
			</div>
		);
	};

	return renderContent();
}
