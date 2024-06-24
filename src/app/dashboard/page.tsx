'use client';

import { useState } from 'react';
import Drawer from './_components/drawer';
import FileBrowser from './_components/fileBrowser';
import { DashboardView } from '../types/views';



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
