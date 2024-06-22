'use client';

import { ReactNode } from 'react';

export default function DashboardLayout({
	children,
}: Readonly<{
	children: ReactNode;
}>) {
	return (
		<main className='mx-auto bg-google-extraLightBlue'>
			<div className='w-full h-[93dvh] flex'>{children}</div>
		</main>
	);
}
