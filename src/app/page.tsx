'use client';

import { useOrganization, useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';

import { api } from '../../convex/_generated/api';

import UploadButton from './dashboard/_components/uploadButton';
import FileCard from './dashboard/_components/fileCard';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';

import emptyPlaceholder from '../../public/emptyPlaceholder.svg';

export default function Home() {
	const organization = useOrganization();
	const user = useUser();

	let orgId = null;
	if (organization.isLoaded && user.isLoaded) {
		orgId = organization.organization?.id ?? user.user?.id;
	}

	const files = useQuery(api.files.getFiles, {
		orgId: orgId ?? 'skip',
	});

	const renderFiles = () => {
		if (files === undefined) {
			return (
				<div className='h-[70dvh] flex flex-col items-center justify-center gap-4 text-gray-400'>
					<Loader2 className='animate-spin h-20 w-20' />
					Loading files...
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
			<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
				{files?.map((file, idx) => <FileCard key={idx} file={file} />)}
			</div>
		);
	};

	return (
		<main className='container mx-auto pt-12'>
			<div className='flex justify-between items-center mb-8'>
				<h1 className='text-4xl font-bold'>Your files</h1>

				<UploadButton />
			</div>
			{renderFiles()}
		</main>
	);
}
