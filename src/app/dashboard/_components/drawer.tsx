'use client';

import Link from 'next/link';
import { Dispatch, ReactNode, SetStateAction } from 'react';
import UploadButton from './uploadButton';
import { LaptopMinimal, Star, Trash } from 'lucide-react';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { DashboardView } from '../page';

type DrawerProps = {
	currentView: DashboardView;
	setCurrentView: Dispatch<SetStateAction<DashboardView>>;
};

const Drawer = ({ currentView, setCurrentView }: DrawerProps) => {
	const renderDrawerButton = (
		link: DashboardView,
		label: string,
		icon: ReactNode
	) => {
		return (
			<div
				onClick={() => setCurrentView(link)}
				className={clsx(
					'w-full h-[2.5rem] py-2 px-4 box-border flex items-center gap-2 rounded-full cursor-pointer',
					{
						'bg-google-blue': currentView === link,
						'hover:bg-gray-200': currentView !== link,
					}
				)}
			>
				{icon}
				{label}
			</div>
		);
	};

	return (
		<div className='w-[17rem] h-full px-4 box-border flex flex-col gap-4'>
			<UploadButton />
			<div className='flex flex-col'>
				{renderDrawerButton(
					DashboardView.files,
					'All files',
					<LaptopMinimal className='h-4 w-4' />
				)}
				{renderDrawerButton(
					DashboardView.starred,
					'Starred',
					<Star className='h-4 w-4' />
				)}
				{renderDrawerButton(
					DashboardView.trash,
					'Trash',
					<Trash className='h-4 w-4' />
				)}
			</div>
		</div>
	);
};

export default Drawer;
