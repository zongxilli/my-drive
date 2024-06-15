'use client';

import { useOrganization, useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';

import { api } from '../../convex/_generated/api';

import UploadButton from './dashboard/_components/uploadButton';

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

	return (
		<main className='container mx-auto pt-12'>
			<div className='flex justify-between items-center'>
				<h1 className='text-4xl font-bold'>Your files</h1>

				<UploadButton />
			</div>

			{files?.map((file, idx) => <div key={idx}>{file.name}</div>)}
		</main>
	);
}
