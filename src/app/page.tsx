'use client';

import { useOrganization, useUser } from '@clerk/nextjs';
import { useMutation, useQuery } from 'convex/react';

import { api } from '../../convex/_generated/api';

import { Button } from '@/components/ui/button';

export default function Home() {
	const organization = useOrganization();
	const user = useUser();

	let orgId = null;
	if (organization.isLoaded && user.isLoaded) {
		orgId = organization.organization?.id ?? user.user?.id;
	}

	const createFile = useMutation(api.files.createFile);
	const files = useQuery(api.files.getFiles, {
		orgId: orgId ?? 'skip',
	});

	return (
		<main className='flex min-h-screen flex-col items-center justify-between p-24'>
			{files?.map((file, idx) => <div key={idx}>{file.name}</div>)}

			<Button
				onClick={() => {
					if (orgId) {
						createFile({ name: 'test file name', orgId });
					}
				}}
			>
				Click
			</Button>
		</main>
	);
}
