'use client';

import { useOrganization, useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';

import Image from 'next/image';
import { HomeIcon, LaptopMinimal, Loader2, Star, Trash } from 'lucide-react';

import emptyPlaceholder from '../../../../public/emptyPlaceholder.svg';
import emptySearchResultPlaceholder from '../../../../public/emptySearchResultPlaceholder.svg';
import { ReactNode, useCallback, useMemo, useState } from 'react';
import useDebouncedState from '@/hooks/useDebounceState';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import SearchBar from '../_components/searchBar';
import FileCard from '../_components/fileCard';
import { api } from '../../../../convex/_generated/api';
import { usePathname } from 'next/navigation';

export default function FileBrowser() {
	const organization = useOrganization();
	const user = useUser();
	const pathname = usePathname();

	const [searchQuery, setSearchQuery] = useState('');
	const debouncedSearchQuery = useDebouncedState(searchQuery);

	let orgId = null;
	if (organization.isLoaded && user.isLoaded) {
		orgId = organization.organization?.id ?? user.user?.id;
	}

	const files = useQuery(api.files.getFiles, {
		orgId: orgId ?? 'skip',
		starred: pathname === '/dashboard/starred',
	});

	const filterFunction = useCallback(
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

	const filteredFiles = useMemo(() => {
		if (!files) return [];
		return files.filter((file) => filterFunction(file.name));
	}, [files, filterFunction]);

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
			<div className='grid grid-cols-card-auto-fill-minmax gap-6'>
				{filteredFiles.map((file, idx) => (
					<FileCard key={idx} file={file} />
				))}
			</div>
		);
	};

	const renderContent = () => {
		return (
			<div className='flex-grow h-[92dvh] mr-2 rounded-2xl overflow-hidden bg-google-white shadow-sm'>
				<div className='w-full h-full p-4 box-border overflow-auto custom-scrollbar'>
					<div className='flex justify-center items-center mb-8'>
						{/* <h1 className='text-4xl font-bold'>Your files</h1> */}
						<SearchBar
							searchQuery={searchQuery}
							setSearchQuery={setSearchQuery}
						/>
					</div>

					{renderFiles()}
				</div>
			</div>
		);
	};

	return renderContent();
}
