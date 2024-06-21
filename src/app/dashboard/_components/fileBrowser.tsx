'use client';

import { useOrganization, useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';

import Image from 'next/image';
import {
	AlignJustify,
	HomeIcon,
	LaptopMinimal,
	LayoutGrid,
	Loader2,
	Star,
	Trash,
} from 'lucide-react';

import emptyPlaceholder from '../../../../public/emptyPlaceholder.svg';
import emptySearchResultPlaceholder from '../../../../public/emptySearchResultPlaceholder.svg';
import emptyStarredPlaceholder from '../../../../public/emptyStarredPlaceholder.svg';
import emptyTrashPlaceholder from '../../../../public/emptyTrashPlaceholder.svg';
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
import { FileType } from '@/app/types/file';

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

	let orgId = null;
	if (organization.isLoaded && user.isLoaded) {
		orgId = organization.organization?.id ?? user.user?.id;
	}

	const files = useQuery(api.files.getFiles, {
		orgId: orgId ?? 'skip',
	});

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

	const filteredFiles = useMemo(() => {
		if (!files) return [];

		const filtered = files.filter(
			(file) =>
				filterSearchQueryFunction(file.name) &&
				filterFileTypeFunction(file.type)
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
	]);

	const renderFiles = () => {
		if (files === undefined) {
			return (
				<div className='h-[70dvh] flex flex-col items-center justify-center gap-4 text-gray-400'>
					<Loader2 className='animate-spin h-20 w-20' />
					Loading files...
				</div>
			);
		}

		if (searchQuery !== '' && filteredFiles.length === 0) {
			return (
				<div className='h-[70dvh] flex flex-col items-center justify-center gap-8'>
					<Image
						priority
						alt='empty search result placeholder'
						width={300}
						height={300}
						src={emptySearchResultPlaceholder}
					/>
					No results found for {searchQuery}
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

	const renderFilterButton = () => {
		const options = [
			{
				value: FileType.image,
				label: (
					<div className='flex items-center gap-2'>
						<IoImages className='h-4 w-4 flex-shrink-0 text-blue-600' />
						Image
					</div>
				),
			},
			{
				value: FileType.pdf,
				label: (
					<div className='flex items-center gap-2'>
						<MdPictureAsPdf className=' h-4 w-4 flex-shrink-0 text-red-600' />
						PDF
					</div>
				),
			},
			{
				value: FileType.csv,
				label: (
					<div className='flex items-center gap-2'>
						<LuText className=' h-4 w-4 flex-shrink-0 text-gray-600' />
						CSV
					</div>
				),
			},
		];

		return (
			<DropdownMenu
				options={options}
				value={fileTypeFilter}
				setValue={setFileTypeFilter}
			/>
		);
	};

	const renderActionsBar = () => {
		return (
			<div className='w-full flex items-center justify-center gap-4'>
				{renderFilterButton()}
				{renderSwitchButton()}
			</div>
		);
	};

	const renderSearchBarAndActionButtons = () => {
		return (
			<div className='flex flex-col items-center gap-4'>
				<SearchBar
					searchQuery={searchQuery}
					setSearchQuery={setSearchQuery}
				/>

				{renderActionsBar()}
			</div>
		);
	};

	const renderContent = () => {
		return (
			<div className='flex-grow h-[92dvh] mr-2 rounded-2xl overflow-hidden bg-google-white shadow-sm'>
				<div className='w-full h-full p-4 box-border overflow-auto custom-scrollbar'>
					<div className='flex justify-center items-center mb-8'>
						{/* <h1 className='text-4xl font-bold'>Your files</h1> */}
						{renderSearchBarAndActionButtons()}
					</div>

					{renderFiles()}
				</div>
			</div>
		);
	};

	return renderContent();
}
