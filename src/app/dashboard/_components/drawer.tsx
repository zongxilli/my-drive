'use client';

import { Dispatch, ReactNode, SetStateAction } from 'react';
import UploadButton from './uploadButton';
import { LaptopMinimal, Star, Trash } from 'lucide-react';
import clsx from 'clsx';
import { useUserIdentity } from '@/hooks';
import { DashboardView } from '@/app/types/views';

type DrawerProps = {
	currentView: DashboardView;
	setCurrentView: Dispatch<SetStateAction<DashboardView>>;
};

const Drawer = ({ currentView, setCurrentView }: DrawerProps) => {
	const { shouldDisableAll } = useUserIdentity();

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
						'bg-google-blue':
							currentView === link && !shouldDisableAll,
						'hover:bg-gray-200':
							currentView !== link && !shouldDisableAll,
						'pointer-events-none text-gray-400': shouldDisableAll,
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
