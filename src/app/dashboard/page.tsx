'use client';

import { useState } from 'react';

import { DashboardView } from '../types/views';

import Drawer from './_components/drawer';
import FileBrowser from './_components/fileBrowser';



export default function DashboardPage() {
	const [currentView, setCurrentView] = useState<DashboardView>(
		DashboardView.files
	);

	return (
		<>
			<Drawer currentView={currentView} setCurrentView={setCurrentView} />
			<FileBrowser
				starredView={currentView === DashboardView.starred}
				trashView={currentView === DashboardView.trash}
			/>
		</>
	);
}
