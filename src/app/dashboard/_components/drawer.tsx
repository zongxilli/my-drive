'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import UploadButton from './uploadButton';
import { LaptopMinimal, Star, Trash } from 'lucide-react';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const Drawer = () => {
	const pathname = usePathname();

	const renderDrawerButton = (
		link: string,
		label: string,
		icon: ReactNode
	) => {
		return (
			<Link href={link}>
				<div
					className={clsx(
						'w-full h-[2.5rem] py-2 px-4 box-border flex items-center gap-2 rounded-full',
						{
							'bg-google-blue': pathname === link,
							'hover:bg-gray-200': pathname !== link,
						}
					)}
				>
					{icon}
					{label}
				</div>
			</Link>
		);
	};

	return (
		<div className='w-[17rem] h-full px-4 box-border flex flex-col gap-4'>
			<UploadButton />
			<div className='flex flex-col'>
				{renderDrawerButton(
					'/dashboard/files',
					'All files',
					<LaptopMinimal className='h-4 w-4' />
				)}
				{renderDrawerButton(
					'/dashboard/starred',
					'Starred',
					<Star className='h-4 w-4' />
				)}
				{renderDrawerButton(
					'/dashboard/trash',
					'Trash',
					<Trash className='h-4 w-4' />
				)}
			</div>
		</div>
	);
};

export default Drawer;
