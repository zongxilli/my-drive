'use client';

import { ReactNode } from 'react';
import Header from './_components/header';

export default function DashboardLayout({
	children,
}: Readonly<{
	children: ReactNode;
}>) {
	return (
		<main className='mx-auto bg-google-extraLightBlue'>
			<Header />
			<div className='w-full h-[93dvh] flex'>{children}</div>
		</main>
	);
}
