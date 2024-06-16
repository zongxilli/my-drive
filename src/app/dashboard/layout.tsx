'use client';

import { ReactNode } from 'react';
import Drawer from './_components/drawer';

export default function DashboardLayout({
	children,
}: Readonly<{
	children: ReactNode;
}>) {
	return (
		<main className='mx-auto bg-google-lightBlue'>
			<div className='w-full h-[93dvh] flex'>
				<Drawer />
				{children}
			</div>
		</main>
	);
}
